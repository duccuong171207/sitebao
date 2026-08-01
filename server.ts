import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';

function escapeHtmlAttr(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON and URL encoded bodies with large capacity limit for multi-image/video bulk uploads
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));

  // Serve static files from data/uploads folder
  app.use('/uploads', express.static(path.join(process.cwd(), 'data/uploads')));

  // --- PUBLIC VISITOR API ROUTES ---

  // Get articles
  app.get('/api/articles', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      const placement = req.query.placement as string;
      
      const articles = db.getArticles({
        category,
        search,
        placement,
        includeUnpublished: false
      });
      res.json({ success: true, articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single article by ID or slug (increments view count)
  app.get('/api/articles/:idOrSlug', (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params;
      const incrementView = req.query.view !== 'false';
      const visitorId = req.ip || req.headers['x-forwarded-for'] as string || 'visitor-anon';
      const article = db.getArticleByIdOrSlug(idOrSlug, incrementView, visitorId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, article });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single story by slug (optimized for fast direct route)
  app.get('/api/stories/:slug', (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const incrementView = req.query.view !== 'false';
      const visitorId = req.ip || req.headers['x-forwarded-for'] as string || 'visitor-anon';
      const article = db.getArticleByIdOrSlug(slug, incrementView, visitorId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Story not found' });
      }

      res.json({ success: true, article });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Like an article
  app.post('/api/articles/:id/like', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const visitorId = req.ip || req.headers['x-forwarded-for'] as string || 'visitor-anon';
      const result = db.likeArticle(id, visitorId);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      res.json({ success: true, likes: result.likes, alreadyLiked: result.alreadyLiked });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Post a visitor comment
  app.post('/api/articles/:id/comments', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { authorName, content, parentId } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Comment content cannot be empty' });
      }

      const comment = db.addVisitorComment(id, authorName, content, parentId);
      if (!comment) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, comment });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Like a comment
  app.post('/api/articles/:id/comments/:commentId/like', (req: Request, res: Response) => {
    try {
      const { id, commentId } = req.params;
      const result = db.likeComment(id, commentId);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }
      res.json({ success: true, likes: result.likes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- AUTHENTICATION API ROUTES ---

  // Admin Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
      }

      const authRes = db.verifyAdminAuth(username, password);
      if (!authRes.success) {
        return res.status(401).json(authRes);
      }

      res.json(authRes);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Verify session / Me
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const isValid = db.validateSessionToken(authHeader);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.json({ success: true, username: 'Luiis David' });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    db.logoutSession(authHeader);
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Change Password
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!db.validateSessionToken(authHeader)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const result = db.changeAdminPassword(oldPassword, newPassword);
    res.json(result);
  });

  // --- PROTECTED ADMIN CMS API ROUTES ---

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!db.validateSessionToken(authHeader)) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    next();
  };

  // Get all articles including drafts and scheduled
  app.get('/api/admin/articles', requireAdmin, (req: Request, res: Response) => {
    try {
      const articles = db.getArticles({ includeUnpublished: true });
      res.json({ success: true, articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new article
  app.post('/api/admin/articles', requireAdmin, (req: Request, res: Response) => {
    try {
      const articleData = req.body;
      const article = db.createArticle(articleData);
      res.json({ success: true, article });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update existing article
  app.put('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = db.updateArticle(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      res.json({ success: true, article: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete article
  app.delete('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteArticle(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Auto-generate 100+ positive seed comments for an article
  app.post('/api/admin/articles/:id/auto-seed-comments', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { count } = req.body;
      const comments = db.autoSeedComments(id, count ? Number(count) : 128);
      if (!comments) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      res.json({ success: true, count: comments.length, comments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear all seed comments from an article
  app.delete('/api/admin/articles/:id/seed-comments', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cleared = db.clearComments(id);
      if (!cleared) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      res.json({ success: true, message: 'All comments cleared' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete/moderate comment
  app.delete('/api/admin/articles/:id/comments/:commentId', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id, commentId } = req.params;
      const deleted = db.deleteComment(id, commentId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }
      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Duplicate article
  app.post('/api/admin/articles/duplicate/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const original = db.getArticleByIdOrSlug(id, false);
      if (!original) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      const duplicate = db.createArticle({
        ...original,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy`,
        status: 'draft',
        views: 0,
        likes: 0,
        shares: 0,
        comments: []
      });

      res.json({ success: true, article: duplicate });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Media Library - Get all media images
  app.get('/api/admin/media', requireAdmin, (req: Request, res: Response) => {
    try {
      const images = db.getMediaLibrary();
      res.json({ success: true, images });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Media Library - Delete image
  app.delete('/api/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteMediaImage(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Media image not found' });
      }
      res.json({ success: true, message: 'Image removed from media library' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Watermark Settings - Get
  app.get('/api/admin/watermark', requireAdmin, (req: Request, res: Response) => {
    try {
      const settings = db.getWatermarkSettings();
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Watermark Settings - Update
  app.post('/api/admin/watermark', requireAdmin, (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updated = db.updateWatermarkSettings(updates);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Database Backup - Export
  app.get('/api/admin/backup', requireAdmin, (req: Request, res: Response) => {
    try {
      const data = db.exportData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=luiis_david_db_backup_${Date.now()}.json`);
      res.send(JSON.stringify(data, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Database Backup - Restore
  app.post('/api/admin/restore', requireAdmin, (req: Request, res: Response) => {
    try {
      const backupData = req.body;
      const restored = db.restoreData(backupData);
      if (!restored) {
        return res.status(400).json({ success: false, error: 'Invalid database backup structure' });
      }
      res.json({ success: true, message: 'Database restored successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Upload / Process image data URL or URL
  app.post('/api/admin/upload-image', requireAdmin, (req: Request, res: Response) => {
    try {
      const { imageData, caption, credit, copyright, altText, watermarkText, watermarkPosition, watermarkOpacity, originalFilename } = req.body;
      if (!imageData) {
        return res.status(400).json({ success: false, error: 'No image data provided' });
      }

      const imgId = 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      let fileUrl = imageData;
      let thumbnailUrl = imageData;

      // Check if imageData is base64 and save it to disk
      if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'public');
          const thumbsDir = path.join(process.cwd(), 'data', 'uploads', 'public', 'thumbs');
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          if (!fs.existsSync(thumbsDir)) {
            fs.mkdirSync(thumbsDir, { recursive: true });
          }

          let ext = 'jpg';
          if (mimeType === 'image/png') ext = 'png';
          else if (mimeType === 'image/gif') ext = 'gif';
          else if (mimeType === 'image/webp') ext = 'webp';

          const filename = `${imgId}.${ext}`;
          const diskPath = path.join(uploadsDir, filename);
          fs.writeFileSync(diskPath, buffer);

          fileUrl = `/uploads/public/${filename}`;
          thumbnailUrl = `/uploads/public/${filename}`;
        }
      }

      // Save processed image metadata object
      const imageObj = {
        id: imgId,
        originalFilename: originalFilename || `photo_${Date.now()}.jpg`,
        publicFilename: `watermarked_${imgId}.jpg`,
        filePath: `data/uploads/private/${imgId}.jpg`,
        publicFilePath: fileUrl,
        watermarkedFilePath: fileUrl,
        thumbnailPath: thumbnailUrl,
        url: fileUrl, // short static URL
        thumbnailUrl: thumbnailUrl,
        originalUploadTimestamp: new Date().toISOString(),
        originalPublicationDate: new Date().toISOString().split('T')[0],
        creator: 'Luiis David Bureau',
        copyrightOwner: 'Luiis David',
        copyrightStatus: 'Protected',
        copyrightNotice: copyright || '© Luiis David — All Rights Reserved',
        watermarkEnabled: true,
        watermarkText: watermarkText || '© Luiis David',
        watermarkPosition: watermarkPosition || 'bottom-right',
        watermarkOpacity: watermarkOpacity || 0.75,
        caption: caption || '',
        description: '',
        credit: credit || 'Luiis David Photography',
        altText: altText || 'Article image uploaded by Luiis David',
        isFeatured: false,
        order: 1,
        adminUploaderId: 'Luiis David',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.addMediaImage(imageObj);

      res.json({ success: true, image: imageObj });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Storage Stats & Capacity Management (500 GB Scalable Cloud Pool)
  app.get('/api/admin/storage-stats', requireAdmin, (req: Request, res: Response) => {
    try {
      const mediaList = db.getMediaLibrary();
      const imageCount = mediaList.length;
      const videoCount = 0;
      let totalBytes = 0;
      mediaList.forEach(m => {
        if (m.url && m.url.startsWith('data:')) {
          totalBytes += Math.round(m.url.length * 0.75);
        } else {
          totalBytes += 800 * 1024;
        }
      });
      const totalCapacityBytes = 500 * 1024 * 1024 * 1024; // 500 GB Scalable Cloud Storage Pool
      const usedBytes = Math.max(totalBytes, 64 * 1024 * 1024);
      const remainingBytes = totalCapacityBytes - usedBytes;
      const usagePercent = Number(((usedBytes / totalCapacityBytes) * 100).toFixed(2));

      res.json({
        success: true,
        stats: {
          totalCapacityBytes,
          usedBytes,
          remainingBytes,
          usagePercent,
          imageCount,
          videoCount,
          totalMedia: imageCount + videoCount,
          formattedTotal: '500 GB (Scalable Enterprise Cloud Storage Pool)',
          formattedUsed: (usedBytes / (1024 * 1024)).toFixed(2) + ' MB',
          formattedRemaining: '499.93 GB'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    app.get(['/ledger/:slug', '/story/:slug', '/news/:slug'], async (req, res, next) => {
      try {
        const { slug } = req.params;
        const article = db.getArticleByIdOrSlug(slug, false, 'ssr-bot');
        
        if (article) {
          const expectedSlug = article.slug || article.id;
          if (slug !== expectedSlug) {
            // Redirect to canonical URL if accessed via old slug or ID
            return res.redirect(301, `/ledger/${expectedSlug}`);
          }
        }
        
        const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        let html = await vite.transformIndexHtml(req.originalUrl, template);
        
        if (article) {
          const safeTitle = escapeHtmlAttr(`${article.title} — THE DAILY LEDGER`);
          const safeDesc = escapeHtmlAttr(article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 180) + '...');
          const safeImg = escapeHtmlAttr(article.images && article.images.length > 0 ? article.images[0].url : '');
          const ogTags = `
            <meta property="og:title" content="${safeTitle}" />
            <meta property="og:description" content="${safeDesc}" />
            <meta property="og:image" content="${safeImg}" />
            <meta property="og:url" content="https://${req.get('host')}/ledger/${article.slug || article.id}" />
            <meta property="og:type" content="article" />
            <meta name="author" content="Luiis David ✓" />
            <script>window.__INITIAL_STORY__ = ${JSON.stringify(article)};</script>
          `;
          html = html.replace('</head>', `${ogTags}</head>`);
        }
        
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // don't serve index.html automatically for directories
    
    app.get(['/ledger/:slug', '/story/:slug', '/news/:slug'], (req, res) => {
      try {
        const { slug } = req.params;
        const article = db.getArticleByIdOrSlug(slug, false, 'ssr-bot');

        if (article) {
          const expectedSlug = article.slug || article.id;
          if (slug !== expectedSlug) {
            // Redirect to canonical URL if accessed via old slug or ID
            return res.redirect(301, `/ledger/${expectedSlug}`);
          }
        }
        
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        
        if (article) {
          const safeTitle = escapeHtmlAttr(`${article.title} — THE DAILY LEDGER`);
          const safeDesc = escapeHtmlAttr(article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 180) + '...');
          const safeImg = escapeHtmlAttr(article.images && article.images.length > 0 ? article.images[0].url : '');
          const ogTags = `
            <meta property="og:title" content="${safeTitle}" />
            <meta property="og:description" content="${safeDesc}" />
            <meta property="og:image" content="${safeImg}" />
            <meta property="og:url" content="https://${req.get('host')}/ledger/${article.slug || article.id}" />
            <meta property="og:type" content="article" />
            <meta name="author" content="Luiis David ✓" />
            <script>window.__INITIAL_STORY__ = ${JSON.stringify(article)};</script>
          `;
          html = html.replace('</head>', `${ogTags}</head>`);
        }
        
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luiis David News Server running at http://localhost:${PORT}`);
  });
}

startServer();
