import React from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { Flame, TrendingUp, Award, Layers } from 'lucide-react';

interface ArticleGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  selectedCategory: string;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  onSelectArticle,
  selectedCategory
}) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16 font-serif text-gray-600 bg-[#FCFAF7] border border-black/10 p-8">
        <p className="text-xl text-black font-bold">No articles found in this section.</p>
        <p className="text-xs mt-2 uppercase tracking-widest text-gray-500">Check back later or select a different category.</p>
      </div>
    );
  }

  // If a specific category filter is active, display in clean grid
  if (selectedCategory !== 'All' && selectedCategory !== 'Latest') {
    return (
      <div className="space-y-6">
        <div className="border-b-2 border-black pb-2 flex items-center justify-between">
          <h2 className="font-serif-headline text-2xl font-bold uppercase tracking-tight text-black">
            {selectedCategory} — The Ledger Dispatch
          </h2>
          <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest font-sans-ui">
            {articles.length} Stories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              article={art}
              variant="standard"
              onSelect={onSelectArticle}
            />
          ))}
        </div>
      </div>
    );
  }

  // HOMEPAGE EDITORIAL NEWSPAPER GRID (HIGH DENSITY)
  const heroStory = articles.find((a) => a.placement === 'hero') || articles[0];
  const sideFeatured = articles.filter((a) => a.id !== heroStory?.id && (a.placement === 'featured' || a.placement === 'breaking')).slice(0, 4);
  const mostReadStories = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const opinionStories = articles.filter((a) => a.category === 'Opinion' || a.category === 'Analysis');
  const standardGrid = articles.filter((a) => a.id !== heroStory?.id && !sideFeatured.some((f) => f.id === a.id));

  return (
    <div className="space-y-10">
      
      {/* HIGH DENSITY 3-COLUMN EDITORIAL HERO ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden border-b border-black/10 bg-[#FCFAF7]">
        
        {/* Left Column: Latest Stories (3 cols) */}
        <div className="lg:col-span-3 border-r border-black/10 p-5 space-y-4 min-w-0">
          <div className="border-b border-black/10 pb-2 flex items-center justify-between flex-wrap gap-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#990000] flex items-center gap-1.5 font-sans-ui">
              <Flame size={14} />
              LATEST STORIES
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans-ui">Live Feed</span>
          </div>

          <div className="space-y-4 divide-y divide-black/10">
            {sideFeatured.map((art) => (
              <div key={art.id} className="pt-3 first:pt-0 min-w-0">
                <ArticleCard
                  article={art}
                  variant="compact"
                  onSelect={onSelectArticle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Main Hero Story (6 cols) */}
        {heroStory && (
          <div className="lg:col-span-6 border-r border-black/10 flex flex-col p-5 bg-[#FCFAF7] min-w-0 overflow-hidden">
            <ArticleCard
              article={heroStory}
              variant="hero"
              onSelect={onSelectArticle}
            />
          </div>
        )}

        {/* Right Column: Opinion & Briefing (3 cols) */}
        <div className="lg:col-span-3 p-4 sm:p-5 bg-gray-50/50 flex flex-col justify-between space-y-6 min-w-0 overflow-hidden w-full max-w-full box-border">
          <div className="space-y-4 min-w-0 max-w-full overflow-hidden">
            <div className="border-b border-black/10 pb-2 flex items-center justify-between min-w-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5 font-sans-ui truncate pr-2 min-w-0">
                <Award size={14} className="shrink-0" />
                <span className="truncate">OPINION & ANALYSIS</span>
              </h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase font-sans-ui shrink-0">Opinion</span>
            </div>

            {opinionStories.slice(0, 2).map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="opinion"
                onSelect={onSelectArticle}
              />
            ))}
          </div>

          {/* Newsletter Briefing Callout */}
          <div className="border-2 border-dashed border-black/20 rounded-lg p-4 sm:p-5 text-center bg-[#FCFAF7] space-y-2 overflow-hidden min-w-0 max-w-full box-border">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 block font-sans-ui truncate">
              The Ledger Dispatch
            </span>
            <h4 className="font-serif-headline text-base font-bold text-black leading-tight break-words">
              The Daily Ledger Morning Briefing
            </h4>
            <p className="text-[11px] text-gray-600 leading-normal break-words">
              Essential global news, markets, and financial intelligence delivered every morning by Luiis David.
            </p>
            <div className="pt-2 flex gap-1 min-w-0 w-full overflow-hidden max-w-full">
              <input 
                type="email" 
                placeholder="reader@domain.com"
                className="flex-1 min-w-0 w-full bg-white border border-black/20 px-2.5 py-1 text-xs rounded-xs font-sans text-black"
                readOnly
              />
              <button className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xs shrink-0 cursor-pointer hover:bg-black/80">
                Join
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 2: MOST READ / TRENDING ROW + STANDARD GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* Main Grid Articles (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <h2 className="font-serif-headline text-2xl font-bold uppercase tracking-tight text-black flex items-center gap-2">
              <Layers size={20} className="text-[#990000]" />
              THE LEDGER EDITION
            </h2>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase font-sans-ui">The Ledger Bureau</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {standardGrid.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                variant="standard"
                onSelect={onSelectArticle}
              />
            ))}
          </div>
        </div>

        {/* Right Most Read Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FCFAF7] border border-black/15 p-5 space-y-4">
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <h3 className="font-serif-headline text-lg font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-900" />
                MOST READ
              </h3>
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase font-sans-ui">24-Hr Metrics</span>
            </div>

            <div className="space-y-3">
              {mostReadStories.map((art, idx) => (
                <div key={art.id} className="flex gap-3 items-start pb-3 border-b border-black/10 last:border-0">
                  <span className="font-serif-headline text-2xl font-black text-[#990000] w-6 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="flex-1">
                    <ArticleCard
                      article={art}
                      variant="compact"
                      onSelect={onSelectArticle}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
