import { Article, Comment, Category, AdminAuthResponse, ArticleImage, WatermarkSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Get Auth token from localStorage
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

    const res = await fetch(`${API_BASE}/articles?${query.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch articles');
    return data.articles;
  },

  // Get single article by ID or slug
  async getArticle(idOrSlug: string, incrementView = true): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${idOrSlug}?view=${incrementView}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Article not found');
    return data.article;
  },

  // Like article
  async likeArticle(id: string): Promise<number> {
    const res = await fetch(`${API_BASE}/articles/${id}/like`, { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to like article');
    return data.likes;
  },

  // Post comment
  async postComment(articleId: string, authorName: string, content: string, parentId?: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, content, parentId })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to post comment');
    return data.comment;
  },

  // Like comment
  async likeComment(articleId: string, commentId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/articles/${articleId}/comments/${commentId}/like`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to like comment');
    return data.likes;
  },

  // --- ADMIN AUTH ---

  async login(username: string, password: string): Promise<AdminAuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async verifyMe(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    this.removeToken();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return await res.json();
  },

  // --- ADMIN CMS ---

  async getAdminArticles(): Promise<Article[]> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch admin articles');
    return data.articles;
  },

  async createArticle(articleData: Partial<Article>): Promise<Article> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create article');
    return data.article;
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update article');
    return data.article;
  },

  async deleteArticle(id: string): Promise<boolean> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.success;
  },

  async duplicateArticle(id: string): Promise<Article> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/duplicate/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to duplicate article');
    return data.article;
  },

  async getMediaLibrary(): Promise<ArticleImage[]> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/media`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch media library');
    return data.images;
  },

  async deleteMediaImage(id: string): Promise<boolean> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.success;
  },

  async getWatermarkSettings(): Promise<WatermarkSettings> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/watermark`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch watermark settings');
    return data.settings;
  },

  async updateWatermarkSettings(settings: Partial<WatermarkSettings>): Promise<WatermarkSettings> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/watermark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update watermark settings');
    return data.settings;
  },

  async exportBackup(): Promise<any> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(backupData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to restore database');
    return true;
  },

  async addSeedComment(articleId: string, authorName: string, content: string): Promise<Comment> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${articleId}/seed-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ authorName, content })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to add seed comment');
    return data.comment;
  },

  async autoSeedComments(articleId: string, count = 128): Promise<number> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${articleId}/auto-seed-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ count })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to auto-seed comments');
    return data.count;
  },

  async clearSeedComments(articleId: string): Promise<boolean> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${articleId}/seed-comments`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.success;
  },

  async deleteComment(articleId: string, commentId: string): Promise<boolean> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/admin/articles/${articleId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.success;
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
    const res = await fetch(`${API_BASE}/admin/upload-image`, {
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
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to process image upload');
    return data.image;
  }
};
