import React from 'react';
import { Eye, ThumbsUp, MessageSquare, Clock, Camera, Play } from 'lucide-react';
import { Article } from '../types';
import { VerifiedAuthor } from './VerifiedAuthor';
import { formatArticleDisplayDate } from '../utils/dateUtils';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'standard' | 'horizontal' | 'compact' | 'opinion';
  onSelect: (article: Article) => void;
}

function formatStatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  onSelect
}) => {
  const featuredImg = article.images.find((img) => img.isFeatured) || article.images[0];
  const imageCount = article.images.length;

  const href = `/ledger/${article.slug || article.id}`;
  
  const handleClick = (e: React.MouseEvent) => {
    // Let browser handle modifier keys (ctrl+click, cmd+click)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    
    e.preventDefault();
    onSelect(article);
  };

  if (variant === 'hero') {
    return (
      <a 
        href={href}
        onClick={handleClick}
        className="group cursor-pointer bg-[#FCFAF7] border border-black/10 hover:border-black transition-all p-5 flex flex-col md:flex-row gap-6 h-full min-w-0 overflow-hidden"
      >
        {/* Hero Left/Top Image */}
        {featuredImg && (
          <div className="md:w-3/5 relative overflow-hidden bg-gray-200 aspect-16/9 rounded-none border border-black/5 shrink-0 min-w-0">
            <img
              src={featuredImg.url}
              alt={featuredImg.altText || article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
            />
            {article.videos && article.videos.length > 0 && (
              <span className="absolute top-2 left-2 bg-[#990000] text-white text-[10px] font-bold uppercase px-2 py-0.5 flex items-center gap-1 shadow-sm font-sans-ui z-10">
                <Play size={10} className="fill-current" /> {article.videos.length > 1 ? `${article.videos.length} Videos` : 'Video'}
              </span>
            )}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                <Camera size={11} /> +{imageCount - 1} Photos
              </span>
            )}
            {featuredImg.copyright && (
              <span className="absolute bottom-2 left-3 text-[10px] text-white/90 font-medium italic drop-shadow-sm max-w-[80%] truncate">
                {featuredImg.copyright}
              </span>
            )}
          </div>
        )}

        {/* Hero Right Content */}
        <div className="md:w-2/5 flex flex-col justify-between space-y-4 min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-800">
                {article.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight flex items-center gap-1">
                <Clock size={11} />
                {article.displayDateTime || formatArticleDisplayDate(article.publishedAtDate, article.publishedAtTime, article.timezone)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif-headline font-bold leading-[1.02] mt-1 mb-3 tracking-tight text-[#111111] group-hover:underline break-words">
              {article.title}
            </h2>

            {article.subtitle && (
              <p className="font-serif-headline text-sm sm:text-base font-semibold text-gray-800 mt-2 line-clamp-2 break-words">
                {article.subtitle}
              </p>
            )}

            <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-serif-body mt-3 line-clamp-3 break-words">
              {article.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-black/10 flex items-center justify-between text-[11px] font-sans flex-wrap gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-black font-bold uppercase text-[10px] tracking-wider font-sans-ui">By</span>
                <VerifiedAuthor name={article.author} showRole={true} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-600 font-mono text-[10px] font-bold">
              <span className="flex flex-col items-center">
                <span>{formatStatNumber(article.views)}</span>
                <span className="text-[8px] uppercase opacity-50">Views</span>
              </span>
              <span className="flex flex-col items-center text-emerald-800">
                <span>{formatStatNumber(article.likes)}</span>
                <span className="text-[8px] uppercase opacity-50">Likes</span>
              </span>
              <span className="flex flex-col items-center text-blue-800">
                <span>{formatStatNumber(article.commentCount)}</span>
                <span className="text-[8px] uppercase opacity-50">Comments</span>
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (variant === 'horizontal') {
    return (
      <a 
        href={href}
        onClick={handleClick}
        className="group cursor-pointer flex gap-4 py-3 border-b border-black/10 last:border-b-0 hover:bg-black/5 px-2 transition-colors min-w-0 overflow-hidden"
      >
        {featuredImg && (
          <div className="w-24 h-18 shrink-0 relative overflow-hidden bg-gray-200 border border-black/5">
            <img
              src={featuredImg.url}
              alt={featuredImg.altText || article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#990000] font-sans-ui">
                {article.category}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight font-sans-ui">
                {article.displayDateTime || formatArticleDisplayDate(article.publishedAtDate, article.publishedAtTime, article.timezone)}
              </span>
            </div>
            <h3 className="font-serif-headline text-sm font-bold text-[#111111] group-hover:underline leading-snug line-clamp-2 break-words">
              {article.title}
            </h3>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-tight font-sans-ui flex-wrap gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-gray-500 font-bold uppercase text-[10px]">By</span>
              <VerifiedAuthor name={article.author} size="sm" />
            </div>
            <span className="font-mono shrink-0">
              {formatStatNumber(article.views)} Views
            </span>
          </div>
        </div>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a 
        href={href}
        onClick={handleClick}
        className="group cursor-pointer py-2 border-b border-black/10 last:border-0 min-w-0 overflow-hidden"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#990000] font-sans-ui block mb-0.5">
          {article.category}
        </span>
        <h4 className="font-serif-headline text-xs font-bold text-[#111111] group-hover:underline line-clamp-2 leading-snug break-words">
          {article.title}
        </h4>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight block mt-1 font-sans-ui">
          {article.displayDateTime || formatArticleDisplayDate(article.publishedAtDate, article.publishedAtTime, article.timezone)} • {formatStatNumber(article.views)} Views
        </span>
      </a>
    );
  }

  if (variant === 'opinion') {
    return (
      <a 
        href={href}
        onClick={handleClick}
        className="group cursor-pointer bg-[#FCFAF7] border-l-4 border-[#111111] pl-3 sm:pl-4 py-2 my-3 hover:opacity-85 transition-opacity min-w-0 overflow-hidden block w-full max-w-full box-border"
      >
        <div className="min-w-0 overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 block mb-1 font-sans-ui truncate">
            Editorial & Column
          </span>
          <h3 className="font-serif-headline text-base sm:text-lg italic font-bold leading-tight text-[#111111] group-hover:underline break-words">
            "{article.title}"
          </h3>
          <p className="font-serif-body text-xs text-gray-700 mt-1 line-clamp-2 break-words">
            {article.summary}
          </p>
        </div>

        <div className="mt-2 text-[11px] font-bold uppercase flex items-center justify-between text-[#111111] font-sans-ui flex-wrap gap-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0 overflow-hidden">
            <VerifiedAuthor name={article.author} size="sm" />
            <span className="font-normal opacity-60 text-[10px] uppercase truncate">• Columnist</span>
          </div>
          <span className="font-mono text-[10px] text-gray-600 shrink-0">{formatStatNumber(article.likes)} Likes</span>
        </div>
      </a>
    );
  }

  // Standard vertical card
  return (
    <a 
      href={href}
      onClick={handleClick}
      className="group cursor-pointer bg-[#FCFAF7] border border-black/15 hover:border-black transition-all p-4 flex flex-col justify-between h-full min-w-0 overflow-hidden flex-1 block"
    >
      <div className="min-w-0">
        {featuredImg && (
          <div className="relative overflow-hidden bg-gray-200 aspect-16/10 mb-3 border border-black/5">
            <img
              src={featuredImg.url}
              alt={featuredImg.altText || article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            {article.videos && article.videos.length > 0 && (
              <span className="absolute top-2 left-2 bg-[#990000] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 flex items-center gap-1 shadow-sm font-sans-ui z-10">
                <Play size={9} className="fill-current" /> Video
              </span>
            )}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 bg-black text-white text-[9px] font-bold uppercase px-1.5 py-0.5 flex items-center gap-1 font-sans-ui">
                <Camera size={10} /> {imageCount} Photos
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-1.5 font-sans-ui flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            article.category === 'Technology' ? 'text-blue-800' :
            article.category === 'Politics' ? 'text-emerald-800' : 'text-[#990000]'
          }`}>
            {article.category}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">•</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
            {article.displayDateTime || formatArticleDisplayDate(article.publishedAtDate, article.publishedAtTime, article.timezone)}
          </span>
        </div>

        <h3 className="font-serif-headline text-lg sm:text-xl font-bold text-[#111111] group-hover:underline leading-tight break-words">
          {article.title}
        </h3>

        <p className="font-serif-body text-xs text-gray-700 mt-2 line-clamp-2 leading-relaxed break-words">
          {article.summary}
        </p>
      </div>

      <div className="pt-3 mt-4 border-t border-black/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-gray-600 font-sans-ui flex-wrap gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[#111111]">By</span>
          <VerifiedAuthor name={article.author} size="sm" />
        </div>
        
        <div className="flex items-center gap-2 font-mono shrink-0">
          <span>{formatStatNumber(article.views)} Views</span>
          <span>•</span>
          <span className="text-emerald-800">{formatStatNumber(article.likes)} Likes</span>
        </div>
      </div>
    </a>
  );
};
