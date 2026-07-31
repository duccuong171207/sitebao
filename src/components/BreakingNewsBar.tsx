import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { Article } from '../types';

interface BreakingNewsBarProps {
  article: Article | null;
  onSelectArticle: (article: Article) => void;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ article, onSelectArticle }) => {
  if (!article) return null;

  const href = `/ledger/${article.slug || article.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    onSelectArticle(article);
  };

  return (
    <div className="bg-black text-white text-xs font-sans py-2 px-4 sm:px-6 border-b border-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="bg-red-700 text-white font-black uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-xs flex items-center gap-1 shrink-0">
            <Zap size={11} className="fill-current animate-bounce" />
            Breaking
          </span>
          <a 
            href={href}
            onClick={handleClick}
            className="font-bold text-white hover:underline truncate text-left cursor-pointer transition-colors text-xs block"
          >
            {article.title}
          </a>
        </div>

        <a 
          href={href}
          onClick={handleClick}
          className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white/90 hover:text-white shrink-0 cursor-pointer"
        >
          Read Full Report <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
};
