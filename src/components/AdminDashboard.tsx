import React, { useState, useEffect } from 'react';
import { 
  Lock, UserCheck, Plus, Edit, Trash2, Eye, ThumbsUp, MessageSquare, 
  Upload, Image as ImageIcon, Calendar, Clock, CheckCircle, XCircle, 
  Save, RefreshCw, LogOut, Key, Shield, Layers, Camera, ArrowUp, ArrowDown, Star,
  Copy, Download, FileSpreadsheet, Sliders, Check, HardDrive, FileText, Play
} from 'lucide-react';
import { Article, ArticleImage, ArticleVideo, Category, ArticleStatus, ArticlePlacement, Comment, WatermarkSettings, WatermarkPosition } from '../types';
import { api } from '../services/api';
import { processImageWatermark, DEFAULT_WATERMARK_SETTINGS } from '../utils/watermark';
import { VerifiedAuthor } from './VerifiedAuthor';
import { RichTextEditor } from './RichTextEditor';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onArticleUpdated
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'articles' | 'create' | 'media' | 'watermark' | 'comments' | 'backup' | 'security'>('articles');

  // Articles & Statistics State
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Form Fields for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('Luiis David');
  const [formCategory, setFormCategory] = useState<Category>('Business');
  const [formTags, setFormTags] = useState('Global Economy, Finance, Trade');
  const [formStatus, setFormStatus] = useState<ArticleStatus>('published');
  const [formPlacement, setFormPlacement] = useState<ArticlePlacement>('normal');
  const [formDate, setFormDate] = useState('2026-07-31');
  const [formTime, setFormTime] = useState('10:30');
  const [formTimezone, setFormTimezone] = useState('EST');
  const [formViews, setFormViews] = useState(125000);
  const [formLikes, setFormLikes] = useState(18400);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formSlug, setFormSlug] = useState('');

  // Multiple Images State
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [newImgCredit, setNewImgCredit] = useState('Luiis David Photography');
  const [newImgCopyright, setNewImgCopyright] = useState('© Luiis David — All Rights Reserved');
  const [isProcessingWatermark, setIsProcessingWatermark] = useState(false);

  // Videos State
  const [videos, setVideos] = useState<ArticleVideo[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCaption, setNewVideoCaption] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');
  const [newVideoPoster, setNewVideoPoster] = useState('');

  // Watermark Settings State
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [watermarkSaveSuccess, setWatermarkSaveSuccess] = useState(false);
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1600&auto=format&fit=crop');
  const [renderedWatermarkPreview, setRenderedWatermarkPreview] = useState<string>('');

  // Media Library State
  const [mediaLibrary, setMediaLibrary] = useState<ArticleImage[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Seed comment form
  const [seedArticleId, setSeedArticleId] = useState('');
  const [seedAuthor, setSeedAuthor] = useState('');
  const [seedContent, setSeedContent] = useState('');

  // Password Change & Backup status
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });
  const [backupMsg, setBackupMsg] = useState({ text: '', isError: false });
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);

  // Verify auth token on mount
  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = async () => {
    const valid = await api.verifyMe();
    setIsAuthenticated(valid);
    if (valid) {
      loadAdminArticles();
      loadWatermarkSettings();
      loadMediaLibrary();
    }
  };

  const loadAdminArticles = async () => {
    setIsLoadingArticles(true);
    try {
      const data = await api.getAdminArticles();
      setArticles(data);
    } catch (err) {
      console.error('Error loading admin articles:', err);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const loadWatermarkSettings = async () => {
    try {
      const settings = await api.getWatermarkSettings();
      setWatermarkSettings(settings);
      updateWatermarkPreview(watermarkPreviewUrl, settings);
    } catch (err) {
      console.error('Error loading watermark settings:', err);
    }
  };

  const loadMediaLibrary = async () => {
    setIsLoadingMedia(true);
    try {
      const images = await api.getMediaLibrary();
      setMediaLibrary(images);
    } catch (err) {
      console.error('Error loading media library:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const updateWatermarkPreview = async (imgUrl: string, settings: WatermarkSettings) => {
    try {
      const { watermarkedUrl } = await processImageWatermark(imgUrl, settings);
      setRenderedWatermarkPreview(watermarkedUrl);
    } catch (err) {
      console.error('Error rendering watermark preview:', err);
    }
  };

  useEffect(() => {
    if (watermarkPreviewUrl) {
      updateWatermarkPreview(watermarkPreviewUrl, watermarkSettings);
    }
  }, [watermarkSettings, watermarkPreviewUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await api.login(usernameInput, passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        loadAdminArticles();
        loadWatermarkSettings();
        loadMediaLibrary();
      } else {
        setLoginError(res.message || (res as any).error || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Server error during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleOpenCreateForm = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormSummary('');
    setFormContent('');
    setFormAuthor('Luiis David');
    setFormCategory('Business');
    setFormTags('Finance, Global Trade');
    setFormStatus('published');
    setFormPlacement('normal');
    setFormDate('2026-07-31');
    setFormTime('10:30');
    setFormTimezone('EST');
    setFormViews(125000);
    setFormLikes(18400);
    setFormSeoTitle('');
    setFormMetaDesc('');
    setFormSlug('');
    setImages([
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1600&auto=format&fit=crop',
        caption: 'Primary photography depicting global trading floor liquidity.',
        description: 'Financial market index monitors displaying real-time rates.',
        credit: 'Luiis David Photography',
        creator: 'Luiis David',
        copyrightOwner: 'Luiis David',
        copyrightNotice: '© Luiis David — All Rights Reserved',
        watermarkEnabled: true,
        watermarkText: watermarkSettings.text || '© Luiis David',
        altText: 'Financial market monitors',
        isFeatured: true,
        order: 1
      }
    ]);
    setVideos([]);
    setActiveTab('create');
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormSubtitle(art.subtitle || '');
    setFormSummary(art.summary || '');
    setFormContent(art.content || '');
    setFormAuthor(art.author || 'Luiis David');
    setFormCategory(art.category);
    setFormTags((art.tags || []).join(', '));
    setFormStatus(art.status);
    setFormPlacement(art.placement);
    setFormDate(art.publishedAtDate || '2026-07-31');
    setFormTime(art.publishedAtTime || '10:30');
    setFormTimezone(art.timezone || 'EST');
    setFormViews(art.views || 0);
    setFormLikes(art.likes || 0);
    setFormSeoTitle(art.seoTitle || '');
    setFormMetaDesc(art.metaDescription || '');
    setFormSlug(art.slug || '');
    setImages(art.images || []);
    setVideos(art.videos || []);
    setActiveTab('create');
  };

  const handleDuplicateArticle = async (id: string) => {
    try {
      const duplicate = await api.duplicateArticle(id);
      loadAdminArticles();
      onArticleUpdated();
      handleEditArticle(duplicate);
    } catch (err) {
      alert('Failed to duplicate article');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    try {
      await api.deleteArticle(id);
      loadAdminArticles();
      onArticleUpdated();
    } catch (err) {
      alert('Could not delete article');
    }
  };

  // Multi-file Watermarking Upload handler (processes 1, 5, 20+ images automatically)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingWatermark(true);
    const fileList: File[] = Array.from(files);

    try {
      const newUploadedImages: ArticleImage[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file: File = fileList[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        if (base64) {
          // Process baking watermark onto the public image
          const { watermarkedUrl, thumbnailUrl } = await processImageWatermark(base64, watermarkSettings);

          const imgObj = await api.uploadImage(
            watermarkedUrl,
            'Uploaded photograph for ' + (formTitle || 'news article'),
            'Luiis David Photography',
            '© Luiis David — All Rights Reserved',
            captionForUpload || (fileList.length > 1 ? `Photograph ${i + 1} by Luiis David` : 'Photograph by Luiis David'),
            watermarkSettings.text || '© Luiis David',
            watermarkSettings.position,
            watermarkSettings.opacity,
            file.name
          );

          if (thumbnailUrl) {
            imgObj.thumbnailUrl = thumbnailUrl;
          }

          newUploadedImages.push(imgObj);
        }
      }

      setImages((prev) => {
        const existingCount = prev.length;
        const updated = [...prev];
        newUploadedImages.forEach((img, idx) => {
          updated.push({
            ...img,
            isFeatured: existingCount === 0 && idx === 0,
            order: existingCount + idx + 1
          });
        });
        return updated;
      });

      loadMediaLibrary();
    } catch (err) {
      console.error('Error processing multi-image upload:', err);
      alert('Failed to process and watermark image files');
    } finally {
      setIsProcessingWatermark(false);
      if (e.target) e.target.value = '';
    }
  };

  const [captionForUpload, setCaptionForUpload] = useState('');

  const handleAddImageFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) return;

    setIsProcessingWatermark(true);
    try {
      const { watermarkedUrl } = await processImageWatermark(newImgUrl.trim(), watermarkSettings);
      
      const newImg: ArticleImage = {
        id: 'img-' + Date.now(),
        url: watermarkedUrl,
        caption: newImgCaption.trim() || 'News photography',
        description: '',
        credit: newImgCredit.trim() || 'Luiis David Photography',
        creator: 'Luiis David Bureau',
        copyrightOwner: 'Luiis David',
        copyrightNotice: newImgCopyright.trim() || '© Luiis David — All Rights Reserved',
        watermarkEnabled: true,
        watermarkText: watermarkSettings.text,
        watermarkPosition: watermarkSettings.position,
        watermarkOpacity: watermarkSettings.opacity,
        altText: newImgCaption.trim() || formTitle,
        isFeatured: images.length === 0,
        order: images.length + 1
      };

      setImages((prev) => [...prev, newImg]);
      setNewImgUrl('');
      setNewImgCaption('');
    } catch (err) {
      alert('Could not apply watermark to image URL. Image added directly.');
      const fallbackImg: ArticleImage = {
        id: 'img-' + Date.now(),
        url: newImgUrl.trim(),
        caption: newImgCaption.trim(),
        description: '',
        credit: newImgCredit.trim(),
        creator: 'Luiis David',
        copyrightOwner: 'Luiis David',
        copyrightNotice: '© Luiis David — All Rights Reserved',
        watermarkEnabled: false,
        watermarkText: '© Luiis David',
        altText: formTitle,
        isFeatured: images.length === 0,
        order: images.length + 1
      };
      setImages(prev => [...prev, fallbackImg]);
    } finally {
      setIsProcessingWatermark(false);
    }
  };

  const handleSetFeaturedImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isFeatured: img.id === id
      }))
    );
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const url = newVideoUrl.trim();
    const totalCount = images.length + videos.length;

    const newVid: ArticleVideo = {
      id: 'vid-' + Date.now(),
      videoUrl: url,
      videoTitle: newVideoTitle.trim() || 'VidHosting Video',
      videoDescription: newVideoDescription.trim() || '',
      videoCaption: newVideoCaption.trim() || 'Footage from the latest market developments.',
      posterUrl: newVideoPoster.trim() || '',
      creator: 'Luiis David',
      copyrightOwner: 'Luiis David',
      copyrightNotice: '© Luiis David — All Rights Reserved',
      isFeatured: totalCount === 0,
      order: totalCount + 1
    };

    setVideos(prev => [...prev, newVid]);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoCaption('');
    setNewVideoDescription('');
    setNewVideoPoster('');
  };

  const handleSetFeaturedVideo = (id: string) => {
    setVideos(prev => prev.map(v => ({ ...v, isFeatured: v.id === id })));
    setImages(prev => prev.map(img => ({ ...img, isFeatured: false })));
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveWatermarkSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateWatermarkSettings(watermarkSettings);
      setWatermarkSettings(updated);
      setWatermarkSaveSuccess(true);
      setTimeout(() => setWatermarkSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save watermark settings');
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luiis_david_cms_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg({ text: 'Database exported successfully!', isError: false });
    } catch (err) {
      setBackupMsg({ text: 'Failed to export database backup', isError: true });
    }
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        await api.restoreBackup(parsed);
        setBackupMsg({ text: 'Database restored successfully! Refreshing contents...', isError: false });
        loadAdminArticles();
        loadMediaLibrary();
        onArticleUpdated();
      } catch (err) {
        setBackupMsg({ text: 'Invalid JSON backup file structure', isError: true });
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (articles.length === 0) return;
    const headers = ['ID', 'Title', 'Category', 'Author', 'Status', 'Placement', 'Views', 'Likes', 'Comments', 'Date'];
    const rows = articles.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.category,
      a.author,
      a.status,
      a.placement,
      a.views,
      a.likes,
      a.commentCount,
      a.publishedAtDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `luiis_david_articles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Article Create / Update
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Headline Title is required');
      return;
    }

    const payload: Partial<Article> = {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      summary: formSummary.trim(),
      content: formContent.trim(),
      author: formAuthor.trim() || 'Luiis David',
      category: formCategory,
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: formStatus,
      placement: formPlacement,
      publishedAtDate: formDate,
      publishedAtTime: formTime,
      timezone: formTimezone,
      views: formViews,
      likes: formLikes,
      seoTitle: formSeoTitle.trim() || `${formTitle.trim()} | Luiis David`,
      metaDescription: formMetaDesc.trim() || formSummary.trim(),
      slug: formSlug.trim(),
      images: images,
      videos: videos
    };

    try {
      if (editingArticleId) {
        await api.updateArticle(editingArticleId, payload);
      } else {
        await api.createArticle(payload);
      }
      loadAdminArticles();
      loadMediaLibrary();
      onArticleUpdated();
      setActiveTab('articles');
      alert(editingArticleId ? 'Article updated successfully!' : 'Article published successfully!');
    } catch (err: any) {
      alert('Error saving article: ' + err.message);
    }
  };

  const handleAutoSeedComments = async (articleId: string) => {
    try {
      const count = await api.autoSeedComments(articleId, 128);
      loadAdminArticles();
      onArticleUpdated();
      alert(`Successfully generated ${count} positive seed comments for this article!`);
    } catch (err: any) {
      alert('Failed to auto-seed comments: ' + err.message);
    }
  };

  const handleClearSeedComments = async (articleId: string) => {
    if (!confirm('Are you sure you want to remove all seed comments from this article?')) return;
    try {
      await api.clearSeedComments(articleId);
      loadAdminArticles();
      onArticleUpdated();
      alert('All seed comments removed from this article.');
    } catch (err) {
      alert('Failed to clear seed comments');
    }
  };

  const handleDeleteComment = async (articleId: string, commentId: string) => {
    if (!confirm('Delete this comment from article?')) return;
    try {
      await api.deleteComment(articleId, commentId);
      loadAdminArticles();
      onArticleUpdated();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });
    if (!oldPass || !newPass) return;

    const res = await api.changePassword(oldPass, newPass);
    if (res.success) {
      setPassMsg({ text: res.message || 'Password changed successfully', isError: false });
      setOldPass('');
      setNewPass('');
    } else {
      setPassMsg({ text: res.message || 'Error changing password', isError: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-sans text-slate-900">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg tracking-wide text-amber-50">
                  Luiis David CMS
                </h2>
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  Official Account Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Independent Editorial Management System & Automatic Watermark Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  LD
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">Luiis David</span>
                    <svg className="w-3.5 h-3.5 text-[#1D9BF0] fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.475 9.55.6 10.92.6 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zM9.8 17.3l-4.2-4.2 1.4-1.4 2.8 2.8 7.4-7.4 1.4 1.4-8.8 8.8z" />
                    </svg>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Role: Publisher / Editor
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-xs flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Login Screen if unauthenticated */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto my-12 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Admin Authentication Required</h3>
            <p className="text-xs text-slate-600 mb-2">
              Enter credentials to access Luiis David news editorial controls and watermark settings.
            </p>
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded px-2.5 py-1.5 mb-6">
              Default: Username <span className="font-bold">Luiis David</span> or <span className="font-bold">admin</span> | Password <span className="font-bold">duc10007</span>
            </p>

            {loginError && (
              <div className="mb-4 text-xs bg-red-50 text-red-700 p-3 rounded border border-red-200">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Luiis David"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded shadow transition flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Sign In to CMS
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Dashboard Interface */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'articles'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-700" /> All Articles ({articles.length})
              </button>

              <button
                onClick={handleOpenCreateForm}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'create'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Plus className="w-4 h-4 text-amber-700" /> {editingArticleId ? 'Edit Article' : 'Create Article'}
              </button>

              <button
                onClick={() => { setActiveTab('watermark'); loadWatermarkSettings(); }}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'watermark'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-700" /> Watermark Settings
              </button>

              <button
                onClick={() => { setActiveTab('media'); loadMediaLibrary(); }}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'media'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-700" /> Media Library ({mediaLibrary.length})
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'comments'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-amber-700" /> Comment Moderation
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'backup'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HardDrive className="w-4 h-4 text-amber-700" /> Backup & Data Safety
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'security'
                    ? 'border-amber-600 text-amber-900 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Key className="w-4 h-4 text-amber-700" /> Security
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {/* TAB 1: ARTICLES INDEX LIST */}
              {activeTab === 'articles' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        Editorial Article Manager
                      </h3>
                      <p className="text-xs text-slate-600">
                        Create, revise, schedule, and moderate independent news publications.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" /> Export CSV
                      </button>
                      <button
                        onClick={handleOpenCreateForm}
                        className="text-xs font-semibold px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded shadow flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-4 h-4" /> New Article
                      </button>
                    </div>
                  </div>

                  {isLoadingArticles ? (
                    <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600" /> Loading editorial database...
                    </div>
                  ) : articles.length === 0 ? (
                    <div className="bg-white p-8 text-center text-slate-500 rounded border border-slate-200">
                      No articles in database. Click "New Article" to create one.
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 border-b border-slate-200 font-semibold">
                          <tr>
                            <th className="py-3 px-4">Headline</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Placement</th>
                            <th className="py-3 px-2">Views</th>
                            <th className="py-3 px-2">Likes</th>
                            <th className="py-3 px-2">Published</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {articles.map((art) => (
                            <tr key={art.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4 font-serif font-bold text-slate-900 max-w-md">
                                <div className="line-clamp-1">{art.title}</div>
                                <div className="text-[11px] font-sans font-normal text-slate-500 line-clamp-1">
                                  {art.summary || art.subtitle}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 border border-slate-200">
                                  {art.category}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold text-[11px] uppercase ${
                                    art.status === 'published'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : art.status === 'draft'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {art.status}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="capitalize font-medium text-slate-600">
                                  {art.placement}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono text-slate-600">
                                {art.views?.toLocaleString()}
                              </td>
                              <td className="py-3 px-2 font-mono text-slate-600">
                                {art.likes?.toLocaleString()}
                              </td>
                              <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                                {art.publishedAtDate}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href={`/ledger/${art.slug || art.id}?preview=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Preview Article"
                                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition inline-flex"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                  </a>
                                  <button
                                    onClick={() => {
                                      const url = `${window.location.origin}/ledger/${art.slug || art.id}`;
                                      navigator.clipboard.writeText(url);
                                      alert('Link copied: ' + url);
                                    }}
                                    title="Copy Link"
                                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                  </button>
                                  <button
                                    onClick={() => handleEditArticle(art)}
                                    title="Edit Article"
                                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateArticle(art.id)}
                                    title="Duplicate Article"
                                    className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArticle(art.id)}
                                    title="Delete Article"
                                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREATE / EDIT ARTICLE FORM */}
              {activeTab === 'create' && (
                <form onSubmit={handleSubmitArticle} className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {editingArticleId ? 'Edit News Article' : 'Compose Independent News Publication'}
                      </h3>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 transition"
                      >
                        <Save className="w-4 h-4" /> Save & Publish
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Main Headline Title *
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Global Markets Shift as Central Banks Signal New Rate Cycle"
                          className="w-full text-base font-serif font-bold px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Subtitle / Deck
                        </label>
                        <input
                          type="text"
                          value={formSubtitle}
                          onChange={(e) => setFormSubtitle(e.target.value)}
                          placeholder="Subheadline deck expanding on key points"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          URL Slug (Custom Permalinks)
                        </label>
                        <input
                          type="text"
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          placeholder="global-markets-shift-rate-cycle (leave blank to auto-generate)"
                          className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Executive Summary (Lead Paragraph)
                        </label>
                        <textarea
                          rows={2}
                          value={formSummary}
                          onChange={(e) => setFormSummary(e.target.value)}
                          placeholder="Brief 2-3 sentence summary displayed in article feeds"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Full Editorial Body Content
                        </label>
                        <RichTextEditor
                          value={formContent}
                          onChange={setFormContent}
                          placeholder="Full journalistic article text. Formatting applies directly."
                          minHeight="400px"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Category Section
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as Category)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        >
                          <option value="World">World</option>
                          <option value="Business">Business</option>
                          <option value="Markets">Markets</option>
                          <option value="Technology">Technology</option>
                          <option value="Politics">Politics</option>
                          <option value="Culture">Culture</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Analysis">Analysis</option>
                          <option value="Opinion">Opinion</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                          <span>Editorial Byline / Author</span>
                          <span className="text-[10px] text-blue-700 font-bold uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            Verified Badge Auto-Applied
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formAuthor}
                            onChange={(e) => setFormAuthor(e.target.value)}
                            placeholder="Luiis David"
                            className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500">Public Byline Preview:</span>
                          <VerifiedAuthor name={formAuthor || 'Luiis David'} role="Publisher / Editor" size="sm" showRole={true} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Publication Status
                        </label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as ArticleStatus)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="unpublished">Unpublished</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Homepage Placement
                        </label>
                        <select
                          value={formPlacement}
                          onChange={(e) => setFormPlacement(e.target.value as ArticlePlacement)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        >
                          <option value="hero">Main Top Lead Story (Hero)</option>
                          <option value="breaking">Breaking News Banner</option>
                          <option value="featured">Featured Columnist</option>
                          <option value="section">Category Lead</option>
                          <option value="normal">Standard Stream</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Publish Date
                        </label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Time
                          </label>
                          <input
                            type="text"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            placeholder="10:30"
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Timezone
                          </label>
                          <input
                            type="text"
                            value={formTimezone}
                            onChange={(e) => setFormTimezone(e.target.value)}
                            placeholder="EST"
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          SEO Meta Title
                        </label>
                        <input
                          type="text"
                          value={formSeoTitle}
                          onChange={(e) => setFormSeoTitle(e.target.value)}
                          placeholder="Search engine title tag"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Keywords / Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formTags}
                          onChange={(e) => setFormTags(e.target.value)}
                          placeholder="Finance, Banking, Rates"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ARTICLE IMAGES SECTION WITH WATERMARK PROTECTION */}
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                          <Camera className="w-4 h-4 text-amber-700" /> Article Photography & Watermark Protection
                        </h4>
                        <p className="text-xs text-slate-500">
                          Uploaded photographs automatically receive a rendered <strong>{watermarkSettings.text}</strong> watermark overlay.
                        </p>
                      </div>
                      <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200 font-medium">
                        Watermark: {watermarkSettings.text} ({watermarkSettings.position})
                      </span>
                    </div>

                    {/* Upload File with Automatic Watermarking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                          <span>Upload Local Photographs (Single or Batch Upload)</span>
                          <span className="text-[10px] text-amber-800 font-bold uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                            Auto Watermark
                          </span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={isProcessingWatermark}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-700 file:text-white hover:file:bg-amber-800 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Select 1, 5, or 20+ images at once. System automatically embeds <strong>{watermarkSettings.text || '© Luiis David'}</strong> onto every image.
                        </p>
                        {isProcessingWatermark && (
                          <div className="text-xs text-amber-700 flex items-center gap-1.5 mt-2 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" /> Automatically embedding © watermark on all uploaded photographs...
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Or Watermark External Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newImgUrl}
                            onChange={(e) => setNewImgUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <button
                            onClick={handleAddImageFromUrl}
                            type="button"
                            disabled={isProcessingWatermark}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded transition"
                          >
                            Apply Watermark
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attached Images List */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Attached Article Images ({images.length})
                      </h5>

                      {images.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No photography attached to this article.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((img) => (
                            <div
                              key={img.id}
                              className={`relative bg-slate-50 rounded-lg border overflow-hidden transition ${
                                img.isFeatured ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-slate-200'
                              }`}
                            >
                              <div className="h-36 bg-slate-200 relative overflow-hidden">
                                <img
                                  src={img.url}
                                  alt={img.altText}
                                  className="w-full h-full object-cover"
                                />
                                {img.isFeatured && (
                                  <span className="absolute top-2 left-2 bg-amber-700 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                                    Main Lead Image
                                  </span>
                                )}
                              </div>
                              <div className="p-3 space-y-1.5 text-xs">
                                <p className="font-semibold text-slate-800 line-clamp-1">{img.caption || 'No caption'}</p>
                                <p className="text-[11px] text-slate-500">{img.credit} — {img.copyrightNotice || '© Luiis David'}</p>
                                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                                  {!img.isFeatured && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetFeaturedImage(img.id)}
                                      className="text-[11px] font-semibold text-amber-800 hover:underline"
                                    >
                                      Make Lead Image
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="text-[11px] font-semibold text-red-700 hover:underline ml-auto"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Video Section */}
                    <div className="pt-6 border-t border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Play size={16} className="text-[#990000]" /> + Add Video (VidHosting.in / Direct URL)
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Supports MP4, WebM, MOV
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Video Direct URL (VidHosting.in / .mp4 / .webm) *
                          </label>
                          <input
                            type="url"
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            placeholder="https://vidhosting.in/.../video.mp4"
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#990000] focus:outline-none font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Video Title (Optional)</label>
                            <input
                              type="text"
                              value={newVideoTitle}
                              onChange={(e) => setNewVideoTitle(e.target.value)}
                              placeholder="e.g. Market Briefing Footage"
                              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Video Poster / Thumbnail Image URL (Optional)</label>
                            <input
                              type="url"
                              value={newVideoPoster}
                              onChange={(e) => setNewVideoPoster(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">Video Caption</label>
                          <input
                            type="text"
                            value={newVideoCaption}
                            onChange={(e) => setNewVideoCaption(e.target.value)}
                            placeholder="Footage from the latest developments in New York."
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">Video Description / Full Details</label>
                          <textarea
                            value={newVideoDescription}
                            onChange={(e) => setNewVideoDescription(e.target.value)}
                            rows={2}
                            placeholder="Detailed description displayed underneath video player..."
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddVideo}
                            className="px-4 py-2 bg-[#990000] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play size={13} className="fill-current" /> Add Video
                          </button>
                        </div>
                      </div>

                      {/* Attached Videos List */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Attached Article Videos ({videos.length})
                        </h5>

                        {videos.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No videos attached to this article.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {videos.map((vid) => (
                              <div
                                key={vid.id}
                                className={`relative bg-slate-50 rounded-lg border overflow-hidden transition ${
                                  vid.isFeatured ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-slate-200'
                                }`}
                              >
                                <div className="h-32 bg-black relative flex items-center justify-center">
                                  {vid.posterUrl ? (
                                    <img src={vid.posterUrl} alt={vid.videoTitle} className="w-full h-full object-cover opacity-80" />
                                  ) : (
                                    <div className="text-white text-xs font-mono opacity-70 truncate px-2">{vid.videoUrl}</div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="w-9 h-9 rounded-full bg-[#990000] text-white flex items-center justify-center shadow">
                                      <Play size={16} className="fill-current ml-0.5" />
                                    </div>
                                  </div>
                                  {vid.isFeatured && (
                                    <span className="absolute top-2 left-2 bg-amber-700 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                                      Featured Media
                                    </span>
                                  )}
                                </div>
                                <div className="p-3 space-y-1.5 text-xs">
                                  <p className="font-semibold text-slate-800 line-clamp-1">{vid.videoTitle || 'VidHosting Video'}</p>
                                  <p className="text-[11px] text-slate-500">{vid.videoCaption || vid.videoUrl}</p>
                                  <p className="text-[10px] text-emerald-800 font-bold">{vid.copyrightNotice || '© Luiis David — All Rights Reserved'}</p>
                                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                                    {!vid.isFeatured && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetFeaturedVideo(vid.id)}
                                        className="text-[11px] font-semibold text-amber-800 hover:underline"
                                      >
                                        Make Featured Media
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVideo(vid.id)}
                                      className="text-[11px] font-semibold text-red-700 hover:underline ml-auto"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('articles')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded shadow transition flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Save Article
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: WATERMARK SETTINGS */}
              {activeTab === 'watermark' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-amber-700" /> Copyright Watermark Configuration System
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Configure default watermarking parameters for photography uploaded to Luiis David editorial publications. Watermarks are rendered directly onto public images.
                      </p>
                    </div>

                    {watermarkSaveSuccess && (
                      <div className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded border border-emerald-200 flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-600" /> Watermark settings updated and saved to system database!
                      </div>
                    )}

                    <form onSubmit={handleSaveWatermarkSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="wmEnable"
                            checked={watermarkSettings.enabled}
                            onChange={(e) => setWatermarkSettings({ ...watermarkSettings, enabled: e.target.checked })}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <label htmlFor="wmEnable" className="text-xs font-bold text-slate-800">
                            Enable Automatic Image Watermarking
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Watermark Notice Text
                          </label>
                          <input
                            type="text"
                            value={watermarkSettings.text}
                            onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })}
                            className="w-full text-xs font-serif font-bold px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="© Luiis David"
                            required
                          />
                          <p className="text-[11px] text-slate-500 mt-1">Default notice: <strong>© Luiis David</strong></p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Watermark Screen Placement Position
                          </label>
                          <select
                            value={watermarkSettings.position}
                            onChange={(e) => setWatermarkSettings({ ...watermarkSettings, position: e.target.value as WatermarkPosition })}
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                          >
                            <option value="top-left">Top Left</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-right">Top Right</option>
                            <option value="center">Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-right">Bottom Right (Default)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Watermark Typography Size
                          </label>
                          <div className="flex gap-4 text-xs font-medium">
                            {(['small', 'medium', 'large'] as const).map((sz) => (
                              <label key={sz} className="flex items-center gap-1.5 cursor-pointer capitalize">
                                <input
                                  type="radio"
                                  name="wmSize"
                                  checked={watermarkSettings.size === sz}
                                  onChange={() => setWatermarkSettings({ ...watermarkSettings, size: sz })}
                                  className="text-amber-600 focus:ring-amber-500"
                                />
                                {sz}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Opacity Density ({Math.round(watermarkSettings.opacity * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={watermarkSettings.opacity}
                            onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                            className="w-full accent-amber-700 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Edge Padding Margin ({watermarkSettings.margin}px)
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            value={watermarkSettings.margin}
                            onChange={(e) => setWatermarkSettings({ ...watermarkSettings, margin: parseInt(e.target.value) })}
                            className="w-full accent-amber-700 cursor-pointer"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 transition"
                        >
                          <Save className="w-4 h-4" /> Save Watermark Settings
                        </button>
                      </div>

                      {/* Live Watermark Canvas Preview */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Live Interactive Watermark Render Preview
                        </label>
                        <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-900 shadow-inner relative min-h-[260px] flex items-center justify-center">
                          {renderedWatermarkPreview ? (
                            <img
                              src={renderedWatermarkPreview}
                              alt="Watermark Preview"
                              className="w-full h-auto max-h-[320px] object-contain"
                            />
                          ) : (
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" /> Generating preview...
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">
                          Real-time canvas rendering shows how the watermark protection label is rendered on published imagery.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA LIBRARY */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        Copyrighted Media Library
                      </h3>
                      <p className="text-xs text-slate-600">
                        All uploaded photography, original filenames, copyright owners, and baked watermark assets.
                      </p>
                    </div>
                    <button
                      onClick={loadMediaLibrary}
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" /> Refresh Library
                    </button>
                  </div>

                  {isLoadingMedia ? (
                    <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600" /> Loading image asset database...
                    </div>
                  ) : mediaLibrary.length === 0 ? (
                    <div className="bg-white p-8 text-center text-slate-500 rounded border border-slate-200">
                      No images in media library yet. Upload images when composing articles.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaLibrary.map((media) => (
                        <div key={media.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                          <div className="h-40 bg-slate-100 relative overflow-hidden">
                            <img src={media.url} alt={media.altText} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                              {media.watermarkText || '© Luiis David'}
                            </span>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{media.caption || media.originalFilename || 'Editorial Asset'}</p>
                              <p className="text-[11px] text-slate-500">Copyright: <strong>{media.copyrightOwner || 'Luiis David'}</strong></p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{media.publicFilename || media.id}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(media.url);
                                  setCopiedMediaId(media.id);
                                  setTimeout(() => setCopiedMediaId(null), 2000);
                                }}
                                className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 hover:underline"
                              >
                                <Copy className="w-3 h-3" /> {copiedMediaId === media.id ? 'Copied URL!' : 'Copy URL'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete image from Media Library?')) {
                                    await api.deleteMediaImage(media.id);
                                    loadMediaLibrary();
                                  }
                                }}
                                className="text-[11px] text-red-600 font-semibold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: COMMENT MODERATION & SEED COMMENTS */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Automated Seed Comments Manager */}
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-700" /> Automated Positive Seed Comment System (100+ per Article)
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Every news article automatically receives 100+ positive pre-configured reader comments upon publication. You can regenerate or clear seeded comments per article below.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-slate-100">
                      {articles.map((art) => {
                        const seedCount = (art.comments || []).filter(c => c.isSeed || c.commentType === 'seed' || c.commentType === 'demo_seed').length;
                        const totalCount = art.comments?.length || 0;

                        return (
                          <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                            <div className="space-y-1 max-w-xl">
                              <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">{art.title}</h4>
                              <p className="text-slate-500 text-[11px]">
                                Published: {art.displayDateTime} · Category: <strong className="text-slate-700">{art.category}</strong>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-mono font-medium">
                                  {totalCount} Total Comments ({seedCount} Seeded)
                                </span>
                                {totalCount >= 100 ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                    ✓ 100+ Target Met
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">
                                    Below 100 Target
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <button
                                onClick={() => handleAutoSeedComments(art.id)}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded shadow flex items-center justify-center gap-1.5 transition"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Generate 125+ Seed Comments
                              </button>
                              <button
                                onClick={() => handleClearSeedComments(art.id)}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs rounded border border-slate-200 hover:border-red-200 transition flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Clear Comments
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment moderation list */}
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-700" /> Reader Comment Stream & Moderation
                    </h3>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {articles.flatMap((art) => (art.comments || []).map((c) => ({ comment: c, article: art }))).length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No comments present in database.</p>
                      ) : (
                        articles.flatMap((art) => (art.comments || []).map((c) => ({ comment: c, article: art }))).slice(0, 100).map(({ comment, article }) => (
                          <div key={comment.id} className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-slate-900">{comment.authorName}</strong>
                                <span className="text-slate-400">• {comment.createdAt}</span>
                                {(comment.isSeed || comment.commentType === 'seed' || comment.commentType === 'demo_seed') && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-medium border border-amber-200">Seed Comment</span>
                                )}
                                <span className="text-slate-500 text-[10px]">♥ {comment.likes || 0} Likes</span>
                              </div>
                              <p className="text-slate-800 font-serif text-xs leading-relaxed">{comment.content}</p>
                              <p className="text-[11px] text-slate-500 font-sans">
                                Article: <strong className="text-slate-800">{article.title}</strong>
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(article.id, comment.id)}
                              className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BACKUP & DATA SAFETY */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-amber-700" /> Database Backup, Export & Restoration
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Ensure zero data loss for Luiis David articles, media library records, watermark configurations, and reader comments.
                      </p>
                    </div>

                    {backupMsg.text && (
                      <div className={`text-xs p-3 rounded border font-medium ${backupMsg.isError ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                        {backupMsg.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                          <Download className="w-4 h-4 text-amber-700" /> Export Full JSON Database
                        </h4>
                        <p className="text-xs text-slate-600">
                          Download a complete JSON snapshot containing all articles, media metadata, redirects, and comments.
                        </p>
                        <button
                          onClick={handleExportBackup}
                          className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded shadow transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Export Backup File (.json)
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-indigo-700" /> Restore Database Snapshot
                        </h4>
                        <p className="text-xs text-slate-600">
                          Upload a previously exported JSON snapshot to restore all database collections.
                        </p>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreBackupFile}
                          className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-700 file:text-white cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SECURITY & SESSIONS */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-xl">
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Key className="w-5 h-5 text-amber-700" /> Admin Credentials & Password Management
                    </h3>

                    {passMsg.text && (
                      <div className={`text-xs p-3 rounded border font-medium ${passMsg.isError ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                        {passMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Current Admin Password
                        </label>
                        <input
                          type="password"
                          value={oldPass}
                          onChange={(e) => setOldPass(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          New Secure Password (min 6 chars)
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded shadow transition"
                      >
                        Update Admin Password
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
