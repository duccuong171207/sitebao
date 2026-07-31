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
import { formatArticleDisplayDate, normalizeArticleDates } from '../utils/dateUtils';

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

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str;
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/Đ/g, 'D');
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/\u02C6|\u0306|\u031B/g, '');
  result = result.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  return result;
}

export function slugifyVietnamese(text: string): string {
  if (!text) return '';
  const clean = removeVietnameseTones(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return clean || 'bai-viet-' + Date.now();
}

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

let memoryArticles: Article[] = getLocalArticles().map(normalizeArticleDates);

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
      const qNorm = removeVietnameseTones(q);
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        removeVietnameseTones(a.title).toLowerCase().includes(qNorm) ||
        a.summary.toLowerCase().includes(q) ||
        removeVietnameseTones(a.summary).toLowerCase().includes(qNorm) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q) || removeVietnameseTones(t).toLowerCase().includes(qNorm)))
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
    const slug = articleData.slug 
      ? slugifyVietnamese(articleData.slug) 
      : slugifyVietnamese(articleData.title || 'untitled-story');

    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const publishedAtDate = articleData.publishedAtDate || `${YYYY}-${MM}-${DD}`;
    const publishedAtTime = articleData.publishedAtTime || `${hh}:${mm}`;
    const timezone = articleData.timezone || 'EST';
    const displayDateTime = articleData.displayDateTime || formatArticleDisplayDate(publishedAtDate, publishedAtTime, timezone);

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
      publishedAtDate,
      publishedAtTime,
      timezone,
      displayDateTime,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: articleData.status || 'published',
      placement: (articleData.placement as ArticlePlacement) || 'normal',
      views: articleData.views || 0,
      likes: articleData.likes || 0,
      commentCount: 0,
      shares: articleData.shares || 0,
      seoTitle: articleData.seoTitle || articleData.title || '',
      metaDescription: articleData.metaDescription || articleData.summary || '',
      comments: [],
      images: articleData.images || [],
      videos: articleData.videos || []
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

    const current = memoryArticles[index];
    const updatedDate = updates.publishedAtDate !== undefined ? updates.publishedAtDate : current.publishedAtDate;
    const updatedTime = updates.publishedAtTime !== undefined ? updates.publishedAtTime : current.publishedAtTime;
    const updatedTz = updates.timezone !== undefined ? updates.timezone : current.timezone;
    const displayDateTime = updates.displayDateTime || formatArticleDisplayDate(updatedDate, updatedTime, updatedTz);

    memoryArticles[index] = {
      ...current,
      ...updates,
      publishedAtDate: updatedDate,
      publishedAtTime: updatedTime,
      timezone: updatedTz,
      displayDateTime,
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
