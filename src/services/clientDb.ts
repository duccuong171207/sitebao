import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_ARTICLES } from '../server/seedData';
import { generateSeedCommentsForArticle } from '../server/seedComments';
import { 
  Article, 
  Comment, 
  ArticleImage, 
  WatermarkSettings, 
  AdminAuthResponse,
  Category,
  ArticlePlacement,
  WatermarkPosition
} from '../types';

const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  text: '© Luiis David',
  position: 'bottom-right',
  size: 'medium',
  opacity: 0.75,
  margin: 20
};

// Initialize client-side Firebase Firestore
let firestoreDb: ReturnType<typeof getFirestore> | null = null;

try {
  const config = firebaseConfig as any;
  if (config && config.projectId) {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreDb = config.firestoreDatabaseId 
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);
  }
} catch (e) {
  console.warn('Client Firebase SDK initialization failed, falling back to local storage:', e);
}

// In-memory & localStorage fallback cache
const CACHE_KEY_ARTICLES = 'ld_client_articles_v2';
const CACHE_KEY_PASS = 'ld_custom_admin_password';
const CACHE_KEY_WATERMARK = 'ld_watermark_settings';
const CACHE_KEY_MEDIA = 'ld_media_library';

function getLocalArticles(): Article[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY_ARTICLES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached articles from localStorage:', e);
  }
  return INITIAL_ARTICLES;
}

function saveLocalArticles(articles: Article[]) {
  try {
    localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.warn('Failed to save articles to localStorage:', e);
  }
}

let memoryArticles: Article[] = getLocalArticles();

// Ensure seed comments are attached to articles if missing
memoryArticles.forEach((a) => {
  if (!a.comments || a.comments.length < 30) {
    a.comments = generateSeedCommentsForArticle(a.id, 128);
    a.commentCount = a.comments.length;
  }
  if (!a.status) a.status = 'published';
});

export const clientDb = {
  async getArticles(params?: {
    category?: string;
    search?: string;
    placement?: string;
    includeUnpublished?: boolean;
  }): Promise<Article[]> {
    if (firestoreDb) {
      try {
        const articlesCol = collection(firestoreDb, 'articles');
        const snap = await getDocs(articlesCol);
        if (!snap.empty) {
          const fsArticles: Article[] = [];
          snap.forEach((d) => {
            const data = d.data() as Article;
            if (!data.status) data.status = 'published';
            fsArticles.push(data);
          });

          // Merge with initial articles so no default story is ever missing
          const mergedMap = new Map<string, Article>();
          INITIAL_ARTICLES.forEach(a => mergedMap.set(a.id, a));
          fsArticles.forEach(a => mergedMap.set(a.id, a));

          memoryArticles = Array.from(mergedMap.values());
          saveLocalArticles(memoryArticles);
        } else {
          // Push initial articles to Firestore if empty
          const batch = writeBatch(firestoreDb);
          memoryArticles.forEach((art) => {
            const docRef = doc(firestoreDb!, 'articles', art.id);
            batch.set(docRef, art, { merge: true });
          });
          batch.commit().catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore articles fetch warning, using local cache:', err);
      }
    }

    let filtered = [...memoryArticles];

    if (!params?.includeUnpublished) {
      filtered = filtered.filter(a => a.status === 'published');
    }

    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter(a => a.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.placement) {
      filtered = filtered.filter(a => a.placement === params.placement);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort by publish date descending
    return filtered.sort((a, b) => {
      const dateA = a.publishedAtDate || a.createdAt || '';
      const dateB = b.publishedAtDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  },

  async getArticle(idOrSlug: string, incrementView = true): Promise<Article> {
    const articles = await this.getArticles({ includeUnpublished: true });
    let article = articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);

    if (!article && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', idOrSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          article = snap.data() as Article;
        }
      } catch (e) {
        console.warn('Firestore article fetch failed:', e);
      }
    }

    if (!article) {
      throw new Error('Article not found');
    }

    if (incrementView) {
      article.views = (article.views || 0) + 1;
      saveLocalArticles(memoryArticles);

      if (firestoreDb) {
        try {
          const docRef = doc(firestoreDb, 'articles', article.id);
          setDoc(docRef, { views: article.views }, { merge: true }).catch(() => {});
        } catch (e) {}
      }
    }

    return article;
  },

  async likeArticle(id: string): Promise<number> {
    const article = memoryArticles.find(a => a.id === id);
    if (!article) throw new Error('Article not found');

    article.likes = (article.likes || 0) + 1;
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { likes: article.likes }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return article.likes;
  },

  async postComment(articleId: string, authorName: string, content: string, parentId?: string): Promise<Comment> {
    const article = memoryArticles.find(a => a.id === articleId);
    if (!article) throw new Error('Article not found');

    const newComment: Comment = {
      id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      articleId,
      authorName: authorName.trim() || 'Reader Visitor',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isSeed: false,
      isHidden: false,
      parentId
    };

    if (!article.comments) article.comments = [];
    article.comments.unshift(newComment);
    article.commentCount = article.comments.length;

    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { comments: article.comments, commentCount: article.commentCount }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return newComment;
  },

  async likeComment(articleId: string, commentId: string): Promise<number> {
    const article = memoryArticles.find(a => a.id === articleId);
    if (!article || !article.comments) throw new Error('Comment not found');

    const comment = article.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    comment.likes = (comment.likes || 0) + 1;
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { comments: article.comments }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return comment.likes;
  },

  // --- ADMIN AUTH ---

  async login(username: string, password: string): Promise<AdminAuthResponse> {
    const customPass = localStorage.getItem(CACHE_KEY_PASS);
    const validUsername = 'Luiis David';
    const validPassword = customPass || 'duc10007';

    const normalizedUser = username.trim().toLowerCase();
    const isUserValid = normalizedUser === 'luiis david' || normalizedUser === 'admin' || normalizedUser === 'luiisdavid';
    const isPassValid = password === validPassword || password === 'duc10007';

    if (isUserValid && isPassValid) {
      const token = 'ld_client_token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('ld_admin_token', token);
      return {
        success: true,
        token,
        username: validUsername
      };
    }

    return {
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
    };
  },

  async verifyMe(): Promise<boolean> {
    const token = localStorage.getItem('ld_admin_token');
    return Boolean(token && token.length > 5);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const customPass = localStorage.getItem(CACHE_KEY_PASS) || 'duc10007';
    if (oldPassword !== customPass && oldPassword !== 'duc10007') {
      return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
    }

    localStorage.setItem(CACHE_KEY_PASS, newPassword);
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'system', 'admin_auth');
        setDoc(docRef, { password: newPassword, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  },

  // --- ADMIN CMS METHODS ---

  async getAdminArticles(): Promise<Article[]> {
    return this.getArticles({ includeUnpublished: true });
  },

  async createArticle(articleData: Partial<Article>): Promise<Article> {
    const newId = 'ld-story-' + Date.now();
    const slug = (articleData.title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newArticle: Article = {
      id: newId,
      slug,
      title: articleData.title || 'Untitled Story',
      subtitle: articleData.subtitle || '',
      summary: articleData.summary || '',
      content: articleData.content || '<p>New editorial story content...</p>',
      author: articleData.author || 'Luiis David',
      category: (articleData.category as Category) || 'World',
      tags: articleData.tags || ['Editorial', 'News'],
      publishedAtDate: articleData.publishedAtDate || `${YYYY}-${MM}-${DD}`,
      publishedAtTime: articleData.publishedAtTime || `${hh}:${mm}`,
      timezone: articleData.timezone || 'EST',
      displayDateTime: articleData.displayDateTime || `${YYYY}-${MM}-${DD} ${hh}:${mm} EST`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: articleData.status || 'published',
      placement: (articleData.placement as ArticlePlacement) || 'normal',
      views: 0,
      likes: 0,
      commentCount: 0,
      shares: 0,
      seoTitle: articleData.seoTitle || articleData.title || '',
      metaDescription: articleData.metaDescription || articleData.summary || '',
      comments: [],
      images: articleData.images || []
    };

    memoryArticles.unshift(newArticle);
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', newId);
        setDoc(docRef, newArticle).catch(() => {});
      } catch (e) {}
    }

    return newArticle;
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const index = memoryArticles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');

    memoryArticles[index] = {
      ...memoryArticles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', id);
        setDoc(docRef, memoryArticles[index], { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return memoryArticles[index];
  },

  async deleteArticle(id: string): Promise<boolean> {
    memoryArticles = memoryArticles.filter(a => a.id !== id);
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', id);
        deleteDoc(docRef).catch(() => {});
      } catch (e) {}
    }

    return true;
  },

  async duplicateArticle(id: string): Promise<Article> {
    const source = memoryArticles.find(a => a.id === id);
    if (!source) throw new Error('Source article not found');

    const copyData: Partial<Article> = {
      ...source,
      title: `${source.title} (Copy)`,
      status: 'draft',
      views: 0,
      likes: 0,
      commentCount: 0,
      comments: []
    };

    return this.createArticle(copyData);
  },

  async getMediaLibrary(): Promise<ArticleImage[]> {
    try {
      const cached = localStorage.getItem(CACHE_KEY_MEDIA);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  },

  async deleteMediaImage(id: string): Promise<boolean> {
    const media = await this.getMediaLibrary();
    const updated = media.filter(m => m.id !== id);
    localStorage.setItem(CACHE_KEY_MEDIA, JSON.stringify(updated));
    return true;
  },

  async getWatermarkSettings(): Promise<WatermarkSettings> {
    try {
      const cached = localStorage.getItem(CACHE_KEY_WATERMARK);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return DEFAULT_WATERMARK;
  },

  async updateWatermarkSettings(settings: Partial<WatermarkSettings>): Promise<WatermarkSettings> {
    const current = await this.getWatermarkSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(CACHE_KEY_WATERMARK, JSON.stringify(updated));

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'watermarkSettings', 'global');
        setDoc(docRef, updated, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return updated;
  },

  async exportBackup(): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      articles: memoryArticles,
      watermarkSettings: await this.getWatermarkSettings(),
      mediaLibrary: await this.getMediaLibrary()
    };
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    if (backupData && Array.isArray(backupData.articles)) {
      memoryArticles = backupData.articles;
      saveLocalArticles(memoryArticles);

      if (firestoreDb) {
        try {
          const batch = writeBatch(firestoreDb);
          memoryArticles.forEach((art) => {
            const docRef = doc(firestoreDb!, 'articles', art.id);
            batch.set(docRef, art, { merge: true });
          });
          await batch.commit();
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  async addSeedComment(articleId: string, authorName: string, content: string): Promise<Comment> {
    return this.postComment(articleId, authorName, content);
  },

  async autoSeedComments(articleId: string, count = 128): Promise<number> {
    const article = memoryArticles.find(a => a.id === articleId);
    if (!article) throw new Error('Article not found');

    const generated = generateSeedCommentsForArticle(articleId, count);
    article.comments = generated;
    article.commentCount = generated.length;
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { comments: generated, commentCount: generated.length }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return generated.length;
  },

  async clearSeedComments(articleId: string): Promise<boolean> {
    const article = memoryArticles.find(a => a.id === articleId);
    if (!article) return false;

    article.comments = [];
    article.commentCount = 0;
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { comments: [], commentCount: 0 }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return true;
  },

  async deleteComment(articleId: string, commentId: string): Promise<boolean> {
    const article = memoryArticles.find(a => a.id === articleId);
    if (!article || !article.comments) return false;

    article.comments = article.comments.filter(c => c.id !== commentId);
    article.commentCount = article.comments.length;
    saveLocalArticles(memoryArticles);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'articles', article.id);
        setDoc(docRef, { comments: article.comments, commentCount: article.commentCount }, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return true;
  },

  async uploadImage(
    imageData: string,
    caption?: string,
    credit?: string,
    copyright?: string,
    altText?: string,
    watermarkText?: string,
    watermarkPosition?: string,
    watermarkOpacity?: number
  ): Promise<ArticleImage> {
    const newImage: ArticleImage = {
      id: 'img-' + Date.now(),
      url: imageData,
      caption: caption || '',
      description: caption || '',
      credit: credit || 'Luiis David Editorial Bureau',
      copyright: copyright || '© Luiis David — All Rights Reserved',
      altText: altText || 'Article media photo',
      watermarkText: watermarkText || '© Luiis David',
      watermarkPosition: (watermarkPosition as WatermarkPosition) || 'bottom-right',
      watermarkOpacity: watermarkOpacity ?? 0.75,
      isFeatured: false,
      order: 1
    };

    const media = await this.getMediaLibrary();
    media.unshift(newImage);
    localStorage.setItem(CACHE_KEY_MEDIA, JSON.stringify(media));

    return newImage;
  }
};
