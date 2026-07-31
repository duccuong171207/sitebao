import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { collection, doc, getDocs, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { 
  Article, Comment, ArticleImage, AdminAuthResponse, 
  WatermarkSettings, SlugRedirect 
} from '../types.js';
import { INITIAL_ARTICLES } from './seedData.js';
import { generateSeedCommentsForArticle } from './seedComments.js';
import { getFirestoreDb } from './firebase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'news_db.json');

interface AdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  text: '© Luiis David',
  position: 'bottom-right',
  size: 'medium',
  opacity: 0.75,
  margin: 20
};

interface DBStructure {
  articles: Article[];
  admin: AdminCredentials;
  activeSessions: Record<string, { username: string; expiresAt: number }>;
  mediaLibrary: ArticleImage[];
  redirects: SlugRedirect[];
  watermarkSettings: WatermarkSettings;
  viewsLog?: Record<string, number>; // "visitorId:articleId" -> timestamp
  likesLog?: Record<string, boolean>; // "visitorId:articleId" -> true
}

// Password hashing helpers using Node's crypto module
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Default initial admin setup: Username "Luiis David", Password "duc10007"
const defaultSalt = generateSalt();
const defaultAdmin: AdminCredentials = {
  username: 'Luiis David',
  salt: defaultSalt,
  passwordHash: hashPassword('duc10007', defaultSalt)
};

class NewsDatabase {
  private data: DBStructure = {
    articles: [],
    admin: defaultAdmin,
    activeSessions: {},
    mediaLibrary: [],
    redirects: [],
    watermarkSettings: DEFAULT_WATERMARK,
    viewsLog: {},
    likesLog: {}
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const loadedArticles = parsed.articles && parsed.articles.length > 0 ? parsed.articles : INITIAL_ARTICLES;
        // Merge INITIAL_ARTICLES to ensure none are ever missing
        const mergedArticlesMap = new Map<string, Article>();
        INITIAL_ARTICLES.forEach(a => mergedArticlesMap.set(a.id, a));
        loadedArticles.forEach((a: Article) => mergedArticlesMap.set(a.id, { ...a, status: a.status || 'published' }));

        this.data = {
          articles: Array.from(mergedArticlesMap.values()),
          admin: parsed.admin || defaultAdmin,
          activeSessions: parsed.activeSessions || {},
          mediaLibrary: parsed.mediaLibrary || [],
          redirects: parsed.redirects || [],
          watermarkSettings: parsed.watermarkSettings || DEFAULT_WATERMARK,
          viewsLog: parsed.viewsLog || {},
          likesLog: parsed.likesLog || {}
        };
      } else {
        this.data = {
          articles: INITIAL_ARTICLES.map(a => ({ ...a, status: 'published' })),
          admin: defaultAdmin,
          activeSessions: {},
          mediaLibrary: [],
          redirects: [],
          watermarkSettings: DEFAULT_WATERMARK,
          viewsLog: {},
          likesLog: {}
        };
      }

      // Ensure every published or existing article has 100+ positive seed comments assigned automatically
      let commentsUpdated = false;
      this.data.articles.forEach((a) => {
        if (!a.comments || a.comments.length < 50) {
          a.comments = generateSeedCommentsForArticle(a.id, 128);
          a.commentCount = a.comments.length;
          commentsUpdated = true;
        }
      });

      if (commentsUpdated || !fs.existsSync(DB_FILE)) {
        this.save();
      }

      this.loadFromFirestore();
    } catch (err) {
      console.error('Error initializing database, using memory fallback:', err);
      this.data = {
        articles: INITIAL_ARTICLES,
        admin: defaultAdmin,
        activeSessions: {},
        mediaLibrary: [],
        redirects: [],
        watermarkSettings: DEFAULT_WATERMARK,
        viewsLog: {},
        likesLog: {}
      };
    }
  }

  private async loadFromFirestore() {
    try {
      const firestore = getFirestoreDb();
      if (!firestore) return;

      const articlesCol = collection(firestore, 'articles');
      const articlesSnap = await getDocs(articlesCol);
      const firestoreArticles: Article[] = [];
      articlesSnap.forEach(docSnap => {
        const art = docSnap.data() as Article;
        if (!art.status) art.status = 'published';
        firestoreArticles.push(art);
      });

      const mergedMap = new Map<string, Article>();
      INITIAL_ARTICLES.forEach(a => mergedMap.set(a.id, { ...a, status: 'published' }));
      firestoreArticles.forEach(a => mergedMap.set(a.id, a));

      if (articlesSnap.empty) {
        // Seed initial articles into Firestore if empty
        const batch = writeBatch(firestore);
        INITIAL_ARTICLES.forEach((art) => {
          const docRef = doc(firestore, 'articles', art.id);
          batch.set(docRef, art, { merge: true });
        });
        await batch.commit();
      }

      this.data.articles = Array.from(mergedMap.values());

      const sysDocRef = doc(firestore, 'system', 'publication_data');
      const sysDoc = await getDoc(sysDocRef);
      if (sysDoc.exists()) {
        const sysData = sysDoc.data();
        if (sysData?.watermarkSettings) this.data.watermarkSettings = sysData.watermarkSettings;
        if (sysData?.mediaLibrary) this.data.mediaLibrary = sysData.mediaLibrary;
        if (sysData?.redirects) this.data.redirects = sysData.redirects;
      }
    } catch (err) {
      console.warn('Firestore load skipped or unavailable:', err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving news database to file:', err);
    }

    // Asynchronously synchronize with Cloud Firestore
    try {
      const firestore = getFirestoreDb();
      if (firestore) {
        const sysDocRef = doc(firestore, 'system', 'publication_data');
        setDoc(sysDocRef, {
          watermarkSettings: this.data.watermarkSettings,
          mediaLibrary: this.data.mediaLibrary,
          redirects: this.data.redirects,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(e => console.warn('Firestore sync warning:', e?.message || e));

        // Sync individual articles to Firestore collection
        const batch = writeBatch(firestore);
        this.data.articles.forEach((art) => {
          const docRef = doc(firestore, 'articles', art.id);
          batch.set(docRef, art, { merge: true });
        });
        batch.commit().catch(e => console.warn('Firestore batch commit warning:', e?.message || e));
      }
    } catch (err) {
      console.warn('Error initiating Firestore sync:', err);
    }
  }

  // --- WATERMARK SETTINGS ---
  public getWatermarkSettings(): WatermarkSettings {
    return this.data.watermarkSettings || DEFAULT_WATERMARK;
  }

  public updateWatermarkSettings(settings: Partial<WatermarkSettings>): WatermarkSettings {
    this.data.watermarkSettings = {
      ...this.getWatermarkSettings(),
      ...settings
    };
    this.save();
    return this.data.watermarkSettings;
  }

  // --- MEDIA LIBRARY ---
  public getMediaLibrary(): ArticleImage[] {
    return this.data.mediaLibrary || [];
  }

  public addMediaImage(img: ArticleImage): ArticleImage {
    if (!this.data.mediaLibrary) this.data.mediaLibrary = [];
    const existingIdx = this.data.mediaLibrary.findIndex(i => i.id === img.id);
    if (existingIdx >= 0) {
      this.data.mediaLibrary[existingIdx] = img;
    } else {
      this.data.mediaLibrary.unshift(img);
    }
    this.save();
    return img;
  }

  public deleteMediaImage(id: string): boolean {
    if (!this.data.mediaLibrary) return false;
    const initialLen = this.data.mediaLibrary.length;
    this.data.mediaLibrary = this.data.mediaLibrary.filter(i => i.id !== id);
    if (this.data.mediaLibrary.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ARTICLES ---

  public getArticles(options?: {
    category?: string;
    search?: string;
    status?: string;
    placement?: string;
    includeUnpublished?: boolean;
  }): Article[] {
    let list = this.data.articles && this.data.articles.length > 0 
      ? [...this.data.articles] 
      : INITIAL_ARTICLES.map(a => ({ ...a, status: 'published' as const }));

    // Ensure all articles have status defaulted if missing
    list = list.map(a => ({
      ...a,
      status: a.status || 'published'
    }));

    if (!options?.includeUnpublished) {
      list = list.filter((a) => {
        const s = (a.status || 'published').toLowerCase();
        return s === 'published' || s === 'live';
      });
    } else if (options?.status) {
      list = list.filter((a) => (a.status || 'published').toLowerCase() === options.status!.toLowerCase());
    }

    if (list.length === 0) {
      list = INITIAL_ARTICLES.map(a => ({ ...a, status: 'published' as const }));
    }

    if (options?.category && options.category !== 'All') {
      const catFiltered = list.filter((a) => a.category.toLowerCase() === options.category!.toLowerCase());
      if (catFiltered.length > 0) {
        list = catFiltered;
      }
    }

    if (options?.placement) {
      const placeFiltered = list.filter((a) => a.placement === options.placement);
      if (placeFiltered.length > 0) {
        list = placeFiltered;
      }
    }

    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by publish date descending
    return list.sort((a, b) => new Date(b.publishedAtDate + 'T' + (b.publishedAtTime || '00:00')).getTime() - new Date(a.publishedAtDate + 'T' + (a.publishedAtTime || '00:00')).getTime());
  }

  public getArticleByIdOrSlug(idOrSlug: string, incrementView = false, visitorId = 'anonymous'): Article | null {
    // Check direct ID or current slug match
    let article = this.data.articles.find((a) => a.id === idOrSlug || a.slug === idOrSlug);

    // If not found, check INITIAL_ARTICLES
    if (!article) {
      article = INITIAL_ARTICLES.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    }

    // If not found, check slug redirects map
    if (!article && this.data.redirects) {
      const redirect = this.data.redirects.find(r => r.oldSlug === idOrSlug);
      if (redirect) {
        article = this.data.articles.find(a => a.id === redirect.articleId || a.slug === redirect.newSlug) ||
                  INITIAL_ARTICLES.find(a => a.id === redirect.articleId || a.slug === redirect.newSlug);
      }
    }

    if (!article) return null;

    if (incrementView) {
      if (!this.data.viewsLog) this.data.viewsLog = {};
      const viewKey = `${visitorId}:${article.id}`;
      const lastView = this.data.viewsLog[viewKey] || 0;
      const now = Date.now();

      // Only increment view count if more than 5 minutes have passed for this visitor session
      if (now - lastView > 5 * 60 * 1000) {
        article.views = (article.views || 0) + 1;
        this.data.viewsLog[viewKey] = now;
        this.save();
      }
    }

    return article;
  }

  public likeArticle(id: string, visitorId = 'anonymous'): { likes: number; alreadyLiked?: boolean } | null {
    const article = this.data.articles.find((a) => a.id === id);
    if (!article) return null;

    if (!this.data.likesLog) this.data.likesLog = {};
    const likeKey = `${visitorId}:${id}`;

    if (this.data.likesLog[likeKey]) {
      return { likes: article.likes, alreadyLiked: true };
    }

    article.likes = (article.likes || 0) + 1;
    this.data.likesLog[likeKey] = true;
    this.save();
    return { likes: article.likes };
  }

  public addVisitorComment(articleId: string, authorName: string, content: string, parentId?: string): Comment | null {
    const article = this.data.articles.find((a) => a.id === articleId);
    if (!article) return null;

    if (!article.comments) article.comments = [];

    const newComment: Comment = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      articleId,
      authorName: authorName.trim() || 'Anonymous Reader',
      content: content.trim(),
      commentType: 'real_user',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isSeed: false,
      isHidden: false,
      parentId
    };

    article.comments.unshift(newComment);
    article.commentCount = article.comments.length;
    this.save();
    return newComment;
  }

  public likeComment(articleId: string, commentId: string): { likes: number } | null {
    const article = this.data.articles.find((a) => a.id === articleId);
    if (!article || !article.comments) return null;

    const comment = article.comments.find((c) => c.id === commentId);
    if (!comment) return null;

    comment.likes = (comment.likes || 0) + 1;
    this.save();
    return { likes: comment.likes };
  }

  // --- ADMIN CMS ACTIONS ---

  public verifyAdminAuth(usernameInput: string, passwordInput: string): AdminAuthResponse {
    const { username, salt, passwordHash } = this.data.admin;

    if (usernameInput.trim() !== username) {
      return { success: false, message: 'Invalid credentials' };
    }

    const testHash = hashPassword(passwordInput, salt);
    if (crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(passwordHash))) {
      // Create session
      const token = 'tok_' + crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
      this.data.activeSessions[token] = { username, expiresAt };
      this.save();
      return { success: true, token, username };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  public validateSessionToken(token?: string): boolean {
    if (!token) return false;
    const cleanToken = token.replace('Bearer ', '').trim();
    const session = this.data.activeSessions[cleanToken];
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      delete this.data.activeSessions[cleanToken];
      this.save();
      return false;
    }
    return true;
  }

  public logoutSession(token?: string) {
    if (!token) return;
    const cleanToken = token.replace('Bearer ', '').trim();
    delete this.data.activeSessions[cleanToken];
    this.save();
  }

  public changeAdminPassword(oldPass: string, newPass: string): { success: boolean; message: string } {
    const { passwordHash, salt } = this.data.admin;
    const testHash = hashPassword(oldPass, salt);
    if (!crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(passwordHash))) {
      return { success: false, message: 'Current password is incorrect' };
    }

    const newSalt = generateSalt();
    this.data.admin.salt = newSalt;
    this.data.admin.passwordHash = hashPassword(newPass, newSalt);
    this.save();
    return { success: true, message: 'Password changed successfully' };
  }

  private generateUniqueSlug(title: string, currentArticleId?: string): string {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    if (!baseSlug) baseSlug = 'article-' + Date.now();

    let candidate = baseSlug;
    let count = 1;

    while (this.data.articles.some(a => a.slug === candidate && a.id !== currentArticleId)) {
      candidate = `${baseSlug}-${count}`;
      count++;
    }

    return candidate;
  }

  public createArticle(articleData: Partial<Article>): Article {
    const newId = 'ld-art-' + Date.now();
    const slug = articleData.slug 
      ? this.generateUniqueSlug(articleData.slug, newId) 
      : this.generateUniqueSlug(articleData.title || 'untitled-news', newId);

    const newArticle: Article = {
      id: newId,
      slug: slug,
      title: articleData.title || 'Untitled Headline',
      subtitle: articleData.subtitle || '',
      summary: articleData.summary || '',
      content: articleData.content || '',
      author: articleData.author || 'Luiis David',
      category: articleData.category || 'Business',
      tags: articleData.tags || [],
      status: articleData.status || 'published',
      placement: articleData.placement || 'normal',
      images: articleData.images || [],
      videos: articleData.videos || [],
      publishedAtDate: articleData.publishedAtDate || new Date().toISOString().split('T')[0],
      publishedAtTime: articleData.publishedAtTime || '10:00',
      timezone: articleData.timezone || 'EST',
      displayDateTime: articleData.displayDateTime || `${articleData.publishedAtDate} — ${articleData.publishedAtTime} ${articleData.timezone || 'EST'}`,
      views: articleData.views || 0,
      likes: articleData.likes || 0,
      commentCount: 0,
      shares: articleData.shares || 0,
      seoTitle: articleData.seoTitle || (articleData.title ? `${articleData.title} | Luiis David` : 'Luiis David News'),
      metaDescription: articleData.metaDescription || articleData.summary || '',
      canonicalUrl: `/ledger/${slug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    // Automatically assign 100+ positive seed comments upon publication
    const seedComments = (articleData.comments && articleData.comments.length >= 50)
      ? articleData.comments
      : generateSeedCommentsForArticle(newId, 128);

    newArticle.comments = seedComments;
    newArticle.commentCount = seedComments.length;

    // Save attached images to media library
    if (newArticle.images && newArticle.images.length > 0) {
      newArticle.images.forEach(img => this.addMediaImage({ ...img, articleId: newId }));
    }

    this.data.articles.unshift(newArticle);
    this.save();
    return newArticle;
  }

  public autoSeedComments(articleId: string, count = 128): Comment[] | null {
    const article = this.data.articles.find(a => a.id === articleId);
    if (!article) return null;

    const newComments = generateSeedCommentsForArticle(articleId, count);
    article.comments = newComments;
    article.commentCount = newComments.length;
    this.save();
    return newComments;
  }

  public clearComments(articleId: string): boolean {
    const article = this.data.articles.find(a => a.id === articleId);
    if (!article) return false;

    article.comments = [];
    article.commentCount = 0;
    this.save();
    return true;
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const index = this.data.articles.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = this.data.articles[index];
    
    // Auto-generate slug if empty
    if ('slug' in updates && !updates.slug) {
      updates.slug = updates.title ? updates.title : current.title;
    }

    // Check if slug changed -> create redirect entry
    if (updates.slug && updates.slug !== current.slug) {
      const newSlugCandidate = this.generateUniqueSlug(updates.slug, id);
      if (!this.data.redirects) this.data.redirects = [];
      
      this.data.redirects.push({
        id: 'red-' + Date.now(),
        oldSlug: current.slug,
        newSlug: newSlugCandidate,
        articleId: id,
        createdAt: new Date().toISOString()
      });

      updates.slug = newSlugCandidate;
      updates.canonicalUrl = `/ledger/${newSlugCandidate}`;
    }

    const updated: Article = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If date/time/timezone updated, regenerate display label if needed
    if (updates.publishedAtDate || updates.publishedAtTime || updates.timezone) {
      const d = updates.publishedAtDate || current.publishedAtDate;
      const t = updates.publishedAtTime || current.publishedAtTime;
      const tz = updates.timezone || current.timezone;
      const dateObj = new Date(`${d}T${t || '00:00'}`);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const timeFormatted = t ? new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
      updated.displayDateTime = `${formattedDate} — ${timeFormatted} ${tz}`;
    }

    // Save attached images to media library
    if (updated.images && updated.images.length > 0) {
      updated.images.forEach(img => this.addMediaImage({ ...img, articleId: id }));
    }

    this.data.articles[index] = updated;
    this.save();
    return updated;
  }

  public deleteArticle(id: string): boolean {
    const initialLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter((a) => a.id !== id);
    if (this.data.articles.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public deleteComment(articleId: string, commentId: string): boolean {
    const article = this.data.articles.find((a) => a.id === articleId);
    if (!article || !article.comments) return false;

    const len = article.comments.length;
    article.comments = article.comments.filter((c) => c.id !== commentId);
    if (article.comments.length < len) {
      article.commentCount = article.comments.length;
      this.save();
      return true;
    }
    return false;
  }

  public addSeedComment(articleId: string, authorName: string, content: string): Comment | null {
    const article = this.data.articles.find((a) => a.id === articleId);
    if (!article) return null;

    if (!article.comments) article.comments = [];

    const seedComment: Comment = {
      id: 'c-seed-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      articleId,
      authorName: authorName.trim(),
      content: content.trim(),
      commentType: 'demo_seed',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      likes: Math.floor(Math.random() * 20) + 5,
      isSeed: true,
      isHidden: false
    };

    article.comments.push(seedComment);
    article.commentCount = article.comments.length;
    this.save();
    return seedComment;
  }

  // --- BACKUP & RESTORE ---
  public exportData(): DBStructure {
    return this.data;
  }

  public restoreData(newData: DBStructure): boolean {
    if (!newData || !Array.isArray(newData.articles)) return false;
    this.data = {
      ...newData,
      admin: newData.admin || this.data.admin
    };
    this.save();
    return true;
  }
}

export const db = new NewsDatabase();
