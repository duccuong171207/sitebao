import React, { useState } from 'react';
import { 
  ArrowLeft, ThumbsUp, MessageSquare, Share2, Printer, Bookmark, 
  Eye, Clock, Shield, Camera, Heart, Check, Send, Award, CornerDownRight, Play 
} from 'lucide-react';
import { Article, Comment, ArticleImage } from '../types';
import { api } from '../services/api';
import { ImageLightbox } from './ImageLightbox';
import { ArticleCard } from './ArticleCard';
import { VerifiedAuthor } from './VerifiedAuthor';
import { FormattedContent } from './FormattedContent';
import { formatArticleDisplayDate } from '../utils/dateUtils';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (art: Article) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  onBack,
  onSelectArticle
}) => {
  const [likes, setLikes] = useState(article.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(article.comments || []);
  const [visibleCommentCount, setVisibleCommentCount] = useState(15);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  
  // Font Size control (16px base, 18px base, 20px base)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  
  // Lightbox controls
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Copy share feedback
  const [copiedShare, setCopiedShare] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const images = article.images || [];
  const videos = article.videos || [];

  const unifiedMedia = [
    ...images.map(img => ({ ...img, mediaType: 'image' as const, sortOrder: img.order || 0 })),
    ...videos.map(vid => ({ ...vid, mediaType: 'video' as const, sortOrder: vid.order || 0 }))
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  const featuredMedia = unifiedMedia.find(m => m.isFeatured) || unifiedMedia[0];
  const secondaryMedia = unifiedMedia.filter(m => m.id !== featuredMedia?.id);
  const featuredImg = images.find((i) => i.isFeatured) || images[0];

  const handleLikeArticle = async () => {
    if (hasLiked) return;
    try {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      await api.likeArticle(article.id);
    } catch (err) {
      console.error('Error liking article:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    setIsSubmittingComment(true);
    try {
      const addedComment = await api.postComment(
        article.id,
        newCommentAuthor || 'Anonymous Reader',
        newCommentContent,
        replyParentId || undefined
      );
      setComments((prev) => [addedComment, ...prev]);
      setNewCommentContent('');
      setNewCommentAuthor('');
      setReplyParentId(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Could not submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
      );
      await api.likeComment(article.id, commentId);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/ledger/${article.slug || article.id}` : '';
  const shareText = `Read "${article.title}" — THE DAILY LEDGER (Published by Luiis David)`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleShareSocial = (platform: 'x' | 'facebook' | 'whatsapp' | 'email') => {
    let url = '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    if (platform === 'x') {
      url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    } else if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
    } else if (platform === 'email') {
      url = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodedText}%0A%0A${encodedUrl}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg leading-relaxed';
    if (fontSize === 'xlarge') return 'text-xl leading-loose';
    return 'text-base leading-relaxed';
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen py-8 px-4 sm:px-6 font-sans text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Publication Title Banner */}
        <div className="border-b-2 border-black pb-3 text-center no-print">
          <span className="font-serif-masthead text-2xl sm:text-3xl font-black uppercase tracking-tight text-black block">
            THE DAILY LEDGER
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-600 tracking-widest font-sans-ui">
            An Independent Digital Publication • Published by Luiis David
          </span>
        </div>

        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4 no-print">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:opacity-60 cursor-pointer transition-opacity font-sans-ui"
          >
            <ArrowLeft size={16} /> Back to Ledger Index
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-mono hidden sm:inline text-[10px]">
              STORY ID: {article.id}
            </span>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                copiedShare 
                  ? 'bg-emerald-700 text-white border-emerald-800' 
                  : 'bg-[#990000] text-white border-[#990000] hover:bg-black'
              }`}
              title="Copy permanent story link to clipboard"
            >
              {copiedShare ? <Check size={13} /> : <Share2 size={13} />}
              {copiedShare ? 'Link Copied' : 'Copy Link'}
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                isBookmarked 
                  ? 'bg-amber-100 border-amber-300 text-amber-900' 
                  : 'bg-white border-black/20 text-gray-800 hover:bg-black/5'
              }`}
            >
              <Bookmark size={13} className={isBookmarked ? 'fill-current' : ''} />
              {isBookmarked ? 'Saved' : 'Save Story'}
            </button>
          </div>
        </div>

        {/* Article Header Section */}
        <header className="space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono">
            <span className="bg-black text-white font-black uppercase tracking-widest text-[10px] px-2.5 py-1">
              {article.category}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1 font-sans">
              <Clock size={12} className="text-red-700" />
              Published: {article.displayDateTime || formatArticleDisplayDate(article.publishedAtDate, article.publishedAtTime, article.timezone)}
            </span>
          </div>

          <h1 className="font-serif-headline text-3xl sm:text-5xl md:text-6xl font-bold text-[#111111] leading-[1.02] tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-serif-headline text-lg sm:text-xl font-semibold text-gray-800 leading-snug border-l-3 border-[#990000] pl-4 italic">
              {article.subtitle}
            </p>
          )}

          {/* Author & Stats Strip */}
          <div className="flex flex-wrap items-center justify-between border-y border-black/10 py-3 text-xs text-gray-600 gap-4 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs font-serif shrink-0 border border-black">
                LD
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-bold uppercase text-[10px] font-sans-ui">By</span>
                  <VerifiedAuthor name={article.author} role="Publisher / Editor" size="md" showRole={true} />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tight font-sans-ui mt-0.5">
                  Official Verified Account • The Daily Ledger
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-gray-600 text-xs">
              <span className="flex items-center gap-1.5" title="Verified Article Views">
                <Eye size={14} className="text-gray-500" />
                <strong>{(article.views || 0).toLocaleString()}</strong> views
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold" title="Likes">
                <ThumbsUp size={14} />
                <strong>{likes.toLocaleString()}</strong> likes
              </span>
              <span className="flex items-center gap-1.5 text-blue-800 font-semibold" title="Comments">
                <MessageSquare size={14} />
                <strong>{comments.length}</strong> comments
              </span>
            </div>
          </div>
        </header>

        {/* Sticky Utility / Engagement Bar */}
        <div className="bg-white border border-[#e2e0d8] p-3 rounded-xs shadow-2xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeArticle}
              disabled={hasLiked}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs text-xs font-bold cursor-pointer transition-all ${
                hasLiked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[#111111] text-white hover:bg-[#990000]'
              }`}
            >
              <ThumbsUp size={14} className={hasLiked ? 'fill-current' : ''} />
              {hasLiked ? 'Liked!' : `Like (${likes})`}
            </button>

            <a
              href="#comments-section"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium bg-[#f1efea] hover:bg-[#e6e2d8] text-gray-800 border border-[#d8d4c8] transition-colors"
            >
              <MessageSquare size={14} />
              Comments ({comments.length})
            </a>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium bg-[#f1efea] hover:bg-[#e6e2d8] text-gray-800 border border-[#d8d4c8] cursor-pointer transition-colors"
              >
                <Share2 size={14} />
                {copiedShare ? 'Link Copied!' : 'Share'}
              </button>

              {showShareMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-md p-2 z-40 space-y-1 text-xs">
                  <button
                    onClick={() => { handleCopyLink(); setShowShareMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded flex items-center gap-2 font-medium text-slate-800"
                  >
                    <Share2 size={13} className="text-slate-600" /> Copy Link
                  </button>
                  <button
                    onClick={() => { handleShareSocial('x'); setShowShareMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded flex items-center gap-2 font-medium text-slate-800"
                  >
                    <span className="font-bold font-mono">𝕏</span> Share on X / Twitter
                  </button>
                  <button
                    onClick={() => { handleShareSocial('facebook'); setShowShareMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded flex items-center gap-2 font-medium text-slate-800"
                  >
                    <span className="font-bold text-blue-700">f</span> Share on Facebook
                  </button>
                  <button
                    onClick={() => { handleShareSocial('whatsapp'); setShowShareMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded flex items-center gap-2 font-medium text-slate-800"
                  >
                    <span className="font-bold text-emerald-600">WA</span> Share on WhatsApp
                  </button>
                  <button
                    onClick={() => { handleShareSocial('email'); setShowShareMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded flex items-center gap-2 font-medium text-slate-800"
                  >
                    <Send size={13} className="text-amber-700" /> Send via Email
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Font size adjuster */}
            <div className="flex items-center gap-1 border border-[#d8d4c8] rounded-xs bg-[#f1efea] p-0.5 text-xs font-mono">
              <span className="text-[10px] text-gray-500 font-sans px-1">Text:</span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-xs cursor-pointer font-bold ${
                  fontSize === 'normal' ? 'bg-white text-black shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-xs cursor-pointer font-bold text-sm ${
                  fontSize === 'large' ? 'bg-white text-black shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 text-gray-600 hover:text-black cursor-pointer rounded-xs hover:bg-gray-200 transition-colors"
              title="Print Article"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>

        {/* Primary Featured Media Section (Image or Video) */}
        {featuredMedia && (
          featuredMedia.mediaType === 'video' ? (
            <figure className="space-y-2 bg-[#f3f0e8] p-3 border border-[#e2e0d8] rounded-xs">
              <div className="relative overflow-hidden rounded-xs bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={featuredMedia.posterUrl}
                  className="w-full max-h-[550px] object-contain mx-auto rounded-xs"
                >
                  <source src={featuredMedia.videoUrl} />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-2 left-2 bg-[#990000] text-white text-[10px] font-bold uppercase px-2.5 py-1 flex items-center gap-1.5 shadow-md">
                  <Play size={12} className="fill-current" /> Featured Video
                </div>
                <div className="absolute bottom-3 left-3 bg-black/85 text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-xs backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                  <Shield size={12} className="text-amber-400" />
                  {featuredMedia.copyrightNotice || '© Luiis David — All Rights Reserved'}
                </div>
              </div>

              <figcaption className="text-xs text-gray-700 font-sans space-y-1 pt-1">
                {featuredMedia.videoTitle && (
                  <h3 className="font-bold text-gray-900 text-sm">{featuredMedia.videoTitle}</h3>
                )}
                {featuredMedia.videoCaption && (
                  <p className="font-medium text-gray-900">{featuredMedia.videoCaption}</p>
                )}
                {featuredMedia.videoDescription && (
                  <p className="text-gray-600">{featuredMedia.videoDescription}</p>
                )}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-300/60 font-mono">
                  <span>Creator: <strong className="text-gray-800">{featuredMedia.creator || 'Luiis David'}</strong></span>
                  <span className="text-emerald-800 font-bold">{featuredMedia.copyrightNotice || '© Luiis David'}</span>
                </div>
              </figcaption>
            </figure>
          ) : (
            <figure className="space-y-2 bg-[#f3f0e8] p-3 border border-[#e2e0d8] rounded-xs">
              <div className="relative group overflow-hidden rounded-xs cursor-pointer" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                <img
                  src={featuredMedia.url}
                  alt={featuredMedia.altText || article.title}
                  className="w-full h-auto object-contain rounded-xs group-hover:scale-[1.005] transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xs flex items-center gap-2 border border-white/20">
                    <Camera size={15} /> View Fullscreen Gallery
                  </span>
                </div>
                
                {/* Copyright Badge Overlay */}
                <div className="absolute bottom-3 left-3 bg-black/85 text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-xs backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                  <Shield size={12} className="text-amber-400" />
                  {featuredMedia.copyright || '© Luiis David — All Rights Reserved'}
                </div>
              </div>

              <figcaption className="text-xs text-gray-700 font-sans space-y-1 pt-1">
                {featuredMedia.caption && (
                  <p className="font-medium text-gray-900">{featuredMedia.caption}</p>
                )}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-300/60">
                  <span>Credit: <strong className="text-gray-800">{featuredMedia.credit || 'Luiis David Photography'}</strong></span>
                  <button 
                    onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                    className="text-[#990000] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} /> Gallery ({images.length} Photos)
                  </button>
                </div>
              </figcaption>
            </figure>
          )
        )}

        {/* Article Full Body Content */}
        <article className={`article-body-content bg-white p-6 sm:p-8 border border-[#e2e0d8] rounded-xs shadow-2xs font-serif-body ${getFontSizeClass()}`}>
          {/* Executive Summary Lead Paragraph if distinct */}
          {article.summary && article.content && !article.content.startsWith(article.summary) && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <FormattedContent content={article.summary} className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug border-l-4 border-[#990000] pl-4 py-1 italic bg-[#fbfaf7]" />
            </div>
          )}

          {/* Render Full Editorial Body Content with preserved line breaks & paragraphs */}
          <FormattedContent content={article.content || article.summary || ''} />

          {/* Secondary Embedded Media (Images & Videos) */}
          {secondaryMedia.length > 0 && (
            <div className="my-8 space-y-8 no-print">
              <h3 className="font-serif-headline text-xl font-bold text-black border-b border-gray-300 pb-2 flex items-center gap-2">
                <Camera size={18} className="text-[#990000]" />
                Additional Editorial Media & Footage
              </h3>

              <div className="space-y-6">
                {secondaryMedia.map((item, idx) => (
                  item.mediaType === 'video' ? (
                    <div key={item.id || idx} className="bg-[#f3f0e8] p-4 border border-[#e2e0d8] rounded-xs space-y-3">
                      <div className="relative overflow-hidden rounded-xs bg-black">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          poster={item.posterUrl}
                          className="w-full max-h-[450px] object-contain mx-auto rounded-xs"
                        >
                          <source src={item.videoUrl} />
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-2 left-2 bg-[#990000] text-white text-[10px] font-bold uppercase px-2 py-0.5 flex items-center gap-1 shadow">
                          <Play size={10} className="fill-current" /> Video Footage
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/85 text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-xs backdrop-blur-xs border border-white/20">
                          {item.copyrightNotice || '© Luiis David'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 font-sans space-y-1">
                        {item.videoTitle && <h4 className="font-bold text-gray-900 text-sm">{item.videoTitle}</h4>}
                        {item.videoCaption && <p className="font-medium text-gray-900">{item.videoCaption}</p>}
                        {item.videoDescription && <p className="text-gray-600">{item.videoDescription}</p>}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-300/60 font-mono">
                          <span>Creator: <strong className="text-gray-800">{item.creator || 'Luiis David'}</strong></span>
                          <span className="text-emerald-800 font-bold">{item.copyrightNotice || '© Luiis David'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <figure 
                      key={item.id || idx} 
                      className="bg-[#f8f6f0] p-3 border border-[#e2e0d8] rounded-xs space-y-2 cursor-pointer hover:border-black transition-all"
                      onClick={() => {
                        const fullIdx = images.findIndex((i) => i.id === item.id);
                        setLightboxIndex(fullIdx >= 0 ? fullIdx : 0);
                        setLightboxOpen(true);
                      }}
                    >
                      <div className="relative overflow-hidden rounded-xs bg-black/5">
                        <img src={item.url} alt={item.caption} className="w-full h-auto object-contain rounded-xs" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] font-medium px-2 py-0.5 rounded-xs">
                          {item.copyright || '© Luiis David'}
                        </span>
                      </div>
                      {item.caption && (
                        <figcaption className="text-xs text-gray-800 font-sans font-medium">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Article Copyright & Rights Box */}
          <div className="mt-8 pt-6 border-t-2 border-[#111111] bg-[#fbfaf8] p-4 text-xs font-sans text-gray-700 space-y-2 rounded-xs">
            <div className="flex items-center gap-2 text-black font-bold uppercase tracking-wider text-xs">
              <Shield size={14} className="text-[#990000]" />
              Copyright & Intellectual Property Notice
            </div>
            <p className="text-gray-600 leading-relaxed">
              <strong>Copyright © Luiis David. All rights reserved.</strong> All text, photography, graphic representations, and editorial analysis contained in this report are protected under international copyright law. Unauthorized copying, syndication, or commercial redistribution without prior written consent from Luiis David is strictly prohibited.
            </p>
          </div>
        </article>

        {/* Comments & Discussion Section */}
        <section id="comments-section" className="bg-white p-6 sm:p-8 border border-[#e2e0d8] rounded-xs space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <h3 className="font-serif-headline text-2xl font-bold text-[#111111] flex items-center gap-2">
              <MessageSquare size={20} className="text-[#990000]" />
              Reader Discussion & Verified Comments ({comments.length})
            </h3>
            <span className="text-xs text-gray-500 font-mono bg-[#f1efea] px-2.5 py-1 rounded-xs border border-[#d8d4c8]">
              Read-Only Editorial Forum
            </span>
          </div>

          {/* Read-Only Forum Notice */}
          <div className="bg-[#f8f6f0] p-3.5 border border-[#e2e0d8] rounded-xs text-xs font-sans text-gray-700 flex items-center justify-between gap-3">
            <span className="text-gray-600">
              💬 <strong>Luiis David Reader Forum:</strong> Displaying {comments.length} verified reader reactions and editorial commentaries. Public comment submission is currently closed for this report.
            </span>
            <span className="text-[10px] font-mono text-gray-500 shrink-0">Updated Real-Time</span>
          </div>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <p className="text-center py-6 text-gray-500 italic text-sm">
                No comments available for this article.
              </p>
            ) : (
              <>
                {comments.slice(0, visibleCommentCount).map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 border rounded-xs transition-colors space-y-2 bg-[#fbfaf8] border-[#e2e0d8]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-serif">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-black block">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {comment.createdAt}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-xs flex items-center gap-1">
                        <Award size={10} /> Verified Reader
                      </span>
                    </div>

                    <p className="font-serif-body text-sm text-gray-800 leading-relaxed pl-9">
                      {comment.content}
                    </p>

                    <div className="flex items-center justify-end gap-4 pl-9 text-xs text-gray-500 pt-1 font-sans">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 hover:text-emerald-700 cursor-pointer font-medium"
                      >
                        <Heart size={12} className="text-rose-600 fill-rose-600/20" />
                        {comment.likes} Likes
                      </button>
                    </div>
                  </div>
                ))}

                {visibleCommentCount < comments.length && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setVisibleCommentCount(prev => prev + 25)}
                      className="px-6 py-2.5 bg-[#111111] hover:bg-[#990000] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                    >
                      Load More Reader Comments ({comments.length - visibleCommentCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4 pt-6 border-t-2 border-[#111111] no-print">
            <h3 className="font-serif-headline text-2xl font-bold text-[#111111]">
              More Coverage from Luiis David
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedArticles.slice(0, 3).map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  variant="standard"
                  onSelect={onSelectArticle}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Image Lightbox Modal */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        articleTitle={article.title}
      />
    </div>
  );
};
