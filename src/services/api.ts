import { Article, Comment, Category, AdminAuthResponse, ArticleImage, WatermarkSettings } from '../types';
import { clientDb } from './clientDb';

const API_BASE = '/api';

let serverQuotaExceeded = false;

function checkQuotaInResponse(data: any) {
  if (data && data.firestoreQuotaExceeded === true) {
    serverQuotaExceeded = true;
  }
}

async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    const data = await res.json();
    checkQuotaInResponse(data);
    return data;
  } catch (err) {
    return null;
  }
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('ld_admin_token');
  },

  setToken(token: string) {
    localStorage.setItem('ld_admin_token', token);
  },

  removeToken() {
    localStorage.removeItem('ld_admin_token');
  },

  // Get articles
  async getArticles(params?: {
    category?: string;
    search?: string;
    placement?: string;
  }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.placement) query.append('placement', params.placement);

    const data = await safeFetch<any>(`${API_BASE}/articles?${query.toString()}`);
    if (data && data.success && Array.isArray(data.articles)) {
      return data.articles;
    }
    return clientDb.getArticles(params);
  },

  // Get single article by ID or slug
  async getArticle(idOrSlug: string, incrementView = true): Promise<Article> {
    const data = await safeFetch<any>(`${API_BASE}/articles/${idOrSlug}?view=${incrementView}`);
    if (data && data.success && data.article) {
      return data.article;
    }
    return clientDb.getArticle(idOrSlug, incrementView);
  },

  // Get single story by slug (optimized direct route)
  async getStoryBySlug(slug: string, incrementView = true): Promise<Article> {
    const data = await safeFetch<any>(`${API_BASE}/stories/${slug}?view=${incrementView}`);
    if (data && data.success && data.article) {
      return data.article;
    }
    return this.getArticle(slug, incrementView);
  },

  // Like article
  async likeArticle(id: string): Promise<number> {
    const data = await safeFetch<any>(`${API_BASE}/articles/${id}/like`, { method: 'POST' });
    if (data && data.success && typeof data.likes === 'number') {
      return data.likes;
    }
    return clientDb.likeArticle(id);
  },

  // Post comment
  async postComment(articleId: string, authorName: string, content: string, parentId?: string): Promise<Comment> {
    const data = await safeFetch<any>(`${API_BASE}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, content, parentId })
    });
    if (data && data.success && data.comment) {
      return data.comment;
    }
    return clientDb.postComment(articleId, authorName, content, parentId);
  },

  // Like comment
  async likeComment(articleId: string, commentId: string): Promise<number> {
    const data = await safeFetch<any>(`${API_BASE}/articles/${articleId}/comments/${commentId}/like`, {
      method: 'POST'
    });
    if (data && data.success && typeof data.likes === 'number') {
      return data.likes;
    }
    return clientDb.likeComment(articleId, commentId);
  },

  // --- ADMIN AUTH ---

  async login(username: string, password: string): Promise<AdminAuthResponse> {
    const data = await safeFetch<any>(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (data && data.success && data.token) {
      this.setToken(data.token);
      return data;
    } else if (data && data.success === false) {
      // Direct server returned auth failure
      return data;
    }

    // Fallback to clientDb authentication
    const clientRes = await clientDb.login(username, password);
    if (clientRes.success && clientRes.token) {
      this.setToken(clientRes.token);
    }
    return clientRes;
  },

  async verifyMe(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const data = await safeFetch<any>(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.verifyMe();
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await safeFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    this.removeToken();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    if (data && typeof data.success === 'boolean') {
      return data;
    }

    return clientDb.changePassword(oldPassword, newPassword);
  },

  // --- ADMIN CMS ---

  async getAdminArticles(): Promise<Article[]> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && data.success && Array.isArray(data.articles)) {
      return data.articles;
    }

    return clientDb.getAdminArticles();
  },

  async createArticle(articleData: Partial<Article>): Promise<Article> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });

    if (data && data.success && data.article) {
      return data.article;
    }

    return clientDb.createArticle(articleData);
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (data && data.success && data.article) {
      return data.article;
    }

    return clientDb.updateArticle(id, updates);
  },

  async deleteArticle(id: string): Promise<boolean> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.deleteArticle(id);
  },

  async duplicateArticle(id: string): Promise<Article> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/duplicate/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && data.success && data.article) {
      return data.article;
    }

    return clientDb.duplicateArticle(id);
  },

  async getMediaLibrary(): Promise<ArticleImage[]> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/media`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && data.success && Array.isArray(data.images)) {
      return data.images;
    }

    return clientDb.getMediaLibrary();
  },

  async getStorageStats(): Promise<any> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/storage-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (data && data.success && data.stats) {
      return data.stats;
    }
    return {
      totalCapacityBytes: 500 * 1024 * 1024 * 1024,
      usedBytes: 50 * 1024 * 1024,
      remainingBytes: 499.95 * 1024 * 1024 * 1024,
      usagePercent: 0.01,
      imageCount: 0,
      videoCount: 0,
      totalMedia: 0,
      formattedTotal: '500 GB (Scalable Enterprise Cloud Storage Pool)',
      formattedUsed: '50.00 MB',
      formattedRemaining: '499.95 GB'
    };
  },

  async deleteMediaImage(id: string): Promise<boolean> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.deleteMediaImage(id);
  },

  async getWatermarkSettings(): Promise<WatermarkSettings> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/watermark`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && data.success && data.settings) {
      return data.settings;
    }

    return clientDb.getWatermarkSettings();
  },

  async updateWatermarkSettings(settings: Partial<WatermarkSettings>): Promise<WatermarkSettings> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/watermark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (data && data.success && data.settings) {
      return data.settings;
    }

    return clientDb.updateWatermarkSettings(settings);
  },

  async exportBackup(): Promise<any> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data) return data;
    return clientDb.exportBackup();
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(backupData)
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.restoreBackup(backupData);
  },

  async addSeedComment(articleId: string, authorName: string, content: string): Promise<Comment> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${articleId}/seed-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ authorName, content })
    });

    if (data && data.success && data.comment) {
      return data.comment;
    }

    return clientDb.addSeedComment(articleId, authorName, content);
  },

  async autoSeedComments(articleId: string, count = 128): Promise<number> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${articleId}/auto-seed-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ count })
    });

    if (data && data.success && typeof data.count === 'number') {
      return data.count;
    }

    return clientDb.autoSeedComments(articleId, count);
  },

  async clearSeedComments(articleId: string): Promise<boolean> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${articleId}/seed-comments`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.clearSeedComments(articleId);
  },

  async deleteComment(articleId: string, commentId: string): Promise<boolean> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/articles/${articleId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data && typeof data.success === 'boolean') {
      return data.success;
    }

    return clientDb.deleteComment(articleId, commentId);
  },

  async uploadImage(
    imageData: string, 
    caption?: string, 
    credit?: string, 
    copyright?: string, 
    altText?: string,
    watermarkText?: string,
    watermarkPosition?: string,
    watermarkOpacity?: number,
    originalFilename?: string
  ): Promise<ArticleImage> {
    const token = this.getToken();
    const data = await safeFetch<any>(`${API_BASE}/admin/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        imageData, 
        caption, 
        credit, 
        copyright, 
        altText,
        watermarkText,
        watermarkPosition,
        watermarkOpacity,
        originalFilename
      })
    });

    if (data && data.success && data.image) {
      return data.image;
    }

    return clientDb.uploadImage(
      imageData, caption, credit, copyright, altText, watermarkText, watermarkPosition, watermarkOpacity
    );
  },

  isFirestoreQuotaExceeded(): boolean {
    return serverQuotaExceeded || clientDb.isQuotaExceeded();
  }
};
