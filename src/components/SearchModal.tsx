import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, ArrowRight } from 'lucide-react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (art: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Article[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const results = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
    setFiltered(results);
  }, [query, articles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-12 px-4 animate-in fade-in duration-150">
      <div className="bg-[#fbfaf8] w-full max-w-3xl rounded-xs border border-[#111111] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-[#e2e0d8] bg-white flex items-center gap-3">
          <Search size={20} className="text-[#990000]" />
          <input
            type="text"
            placeholder="Search The Daily Ledger story archive, markets, or authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-base font-serif-headline focus:outline-hidden text-black placeholder:text-gray-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-gray-500 hover:text-black cursor-pointer px-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black cursor-pointer rounded-xs hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Search size={32} className="mx-auto text-gray-300" />
              <p className="font-serif-headline text-lg text-gray-700">Search The Daily Ledger Archive</p>
              <p className="text-xs">Type a keyword, topic, author name, or category above.</p>
              <div className="pt-4 flex flex-wrap justify-center gap-2 text-xs font-mono font-sans-ui">
                <span className="text-gray-400">Popular:</span>
                {['Markets', 'Quantum', 'Energy', 'Sovereignty', 'Culture'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-[#f1efea] hover:bg-gray-300 px-2 py-1 rounded-xs text-gray-800 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <p className="font-serif-headline text-lg text-gray-800">No Stories Found</p>
              <p className="text-xs">No story matches "{query}". Try a broader query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-[#e2e0d8]">
                Found {filtered.length} matching stories
              </div>
              <div className="space-y-2">
                {filtered.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant="horizontal"
                    onSelect={(selected) => {
                      onSelectArticle(selected);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
