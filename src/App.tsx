import React, { useState, useEffect } from 'react';
import { Article, LegalDocType } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { MarketTicker } from './components/MarketTicker';
import { BreakingNewsBar } from './components/BreakingNewsBar';
import { ArticleGrid } from './components/ArticleGrid';
import { ArticleDetail } from './components/ArticleDetail';
import { SearchModal } from './components/SearchModal';
import { LegalModal } from './components/LegalModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [is404, setIs404] = useState(false);

  // Modals State
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('copyright');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Initial load and category filtering
  useEffect(() => {
    loadArticles();
    checkAdminAuth();
  }, [selectedCategory]);

  // Sync URL and document title when selectedArticle changes
  useEffect(() => {
    if (selectedArticle) {
      const slug = selectedArticle.slug || selectedArticle.id;
      const targetPath = `/ledger/${slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ articleId: selectedArticle.id }, '', targetPath);
      }
      document.title = `${selectedArticle.title} — THE DAILY LEDGER`;
      setIs404(false);
    } else if (!is404) {
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/ledger/')) {
        window.history.pushState(null, '', '/');
      }
      document.title = 'THE DAILY LEDGER — Independent Digital Publication by Luiis David';
    }
  }, [selectedArticle, is404]);

  // Handle URL deep-linking on initial load or browser back/forward buttons
  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      const match = path.match(/^\/(?:ledger|story|news)\/([^/]+)/);
      if (match) {
        const slugOrId = match[1];
        try {
          const article = await api.getArticle(slugOrId, false);
          setSelectedArticle(article);
          setIs404(false);
        } catch (err) {
          console.error('Failed to load article from URL:', err);
          setSelectedArticle(null);
          setIs404(true);
        }
      } else if (path === '/') {
        setSelectedArticle(null);
        setIs404(false);
      }
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await api.getArticles({
        category: selectedCategory === 'All' ? undefined : selectedCategory
      });
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminAuth = async () => {
    const valid = await api.verifyMe();
    setIsAdminLoggedIn(valid);
  };

  const handleSelectArticle = async (art: Article) => {
    try {
      // Fetch full article details and increment view count
      const fullArt = await api.getArticle(art.id, true);
      setSelectedArticle(fullArt);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSelectedArticle(art);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLegal = (type: LegalDocType = 'copyright') => {
    setLegalDocType(type);
    setLegalOpen(true);
  };

  const breakingArticle = articles.find((a) => a.placement === 'breaking') || articles[0] || null;

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#1A1A1A] flex flex-col font-sans selection:bg-gray-200 selection:text-black">
      
      {/* Live Financial Markets Bar */}
      <MarketTicker />

      {/* Main Newspaper Masthead Header */}
      <Header
        isStoryPage={Boolean(selectedArticle)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenLegal={() => handleOpenLegal('copyright')}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={async () => {
          await api.logout();
          setIsAdminLoggedIn(false);
        }}
      />

      {/* Breaking News Ticker Strip */}
      {!selectedArticle && (
        <BreakingNewsBar
          article={breakingArticle}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {/* Main Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {is404 ? (
          <div className="py-32 text-center space-y-6 border border-black/10 rounded-xs shadow-2xs bg-white">
            <h1 className="text-4xl sm:text-5xl font-serif-masthead font-black tracking-tight text-[#111111] uppercase">
              404 &mdash; Story Not Found
            </h1>
            <p className="font-serif-body text-lg text-gray-700 max-w-xl mx-auto">
              We couldn't find the article you were looking for. It may have been removed or the link might be incorrect.
            </p>
            <button
              onClick={() => {
                setIs404(false);
                setSelectedArticle(null);
                window.history.pushState(null, '', '/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-8 inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-[#333333] transition-colors rounded-xs cursor-pointer"
            >
              &larr; Return to The Daily Ledger
            </button>
          </div>
        ) : selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            relatedArticles={articles.filter((a) => a.id !== selectedArticle.id)}
            onBack={() => {
              setSelectedArticle(null);
              window.history.pushState(null, '', '/');
            }}
            onSelectArticle={handleSelectArticle}
          />
        ) : isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-3 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-serif-headline text-lg font-bold text-gray-700">
              Loading Luiis David Editorial Network...
            </p>
          </div>
        ) : (
          <ArticleGrid
            articles={articles}
            onSelectArticle={handleSelectArticle}
            selectedCategory={selectedCategory}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={handleOpenLegal}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        articles={articles}
        onSelectArticle={handleSelectArticle}
      />

      {/* Admin CMS Dashboard Modal */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onArticleUpdated={() => {
          loadArticles();
          checkAdminAuth();
        }}
      />

      {/* Legal & Rights Info Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialType={legalDocType}
      />

    </div>
  );
}
