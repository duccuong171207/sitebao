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
    const path = window.location.pathname;
    const match = path.match(/^\/(?:ledger|story|news)\/([^/]+)/);
    if (match) {
      // Direct story URL: load ONLY the story, do not load full articles list first!
      fetchStoryWithTimeout(match[1]);
      checkAdminAuth();
      // Load background articles list silently
      api.getArticles({ category: selectedCategory === 'All' ? undefined : selectedCategory })
        .then(data => setArticles(data))
        .catch(() => {});
    } else {
      loadArticles();
      checkAdminAuth();
    }
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
  const [loadError, setLoadError] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const fetchStoryWithTimeout = async (slugOrId: string) => {
    setLoadingSlug(slugOrId);
    setLoadError(false);
    setIsLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Story loading timeout')), 10000)
      );
      const fetchPromise = api.getStoryBySlug(slugOrId, false);
      const article = await Promise.race([fetchPromise, timeoutPromise]) as Article;
      
      if (article) {
        setSelectedArticle(article);
        setIs404(false);
        setLoadError(false);
      } else {
        setIs404(true);
      }
    } catch (err) {
      console.error('Failed to load article from URL:', err);
      setLoadError(true);
      setIs404(false);
    } finally {
      setIsLoading(false);
      setLoadingSlug(null);
    }
  };

  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      const match = path.match(/^\/(?:ledger|story|news)\/([^/]+)/);
      if (match) {
        const slugOrId = match[1];
        await fetchStoryWithTimeout(slugOrId);
      } else if (path === '/') {
        setSelectedArticle(null);
        setIs404(false);
        setLoadError(false);
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

      if (selectedArticle) {
        const updatedCurrent = data.find((a) => a.id === selectedArticle.id);
        if (updatedCurrent) {
          try {
            const freshArticle = await api.getArticle(updatedCurrent.id, false);
            setSelectedArticle(freshArticle);
          } catch {
            setSelectedArticle(updatedCurrent);
          }
        }
      }
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
        {loadError ? (
          <div className="py-24 text-center space-y-6 border border-red-200 rounded-xs shadow-sm bg-white max-w-xl mx-auto p-8">
            <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
              !
            </div>
            <h2 className="font-serif-headline text-2xl font-bold text-gray-900">
              Story Could Not Be Loaded
            </h2>
            <p className="text-gray-600 text-sm font-sans">
              Unable to load this Story. The network request timed out or failed. Please check your connection and try again.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  const match = window.location.pathname.match(/^\/(?:ledger|story|news)\/([^/]+)/);
                  if (match) fetchStoryWithTimeout(match[1]);
                }}
                className="bg-[#990000] text-white px-6 py-2.5 font-bold uppercase tracking-wider text-xs hover:bg-black transition-colors rounded-xs cursor-pointer"
              >
                Retry Loading
              </button>
              <button
                onClick={() => {
                  setLoadError(false);
                  setSelectedArticle(null);
                  window.history.pushState(null, '', '/');
                }}
                className="bg-gray-200 text-gray-800 px-6 py-2.5 font-bold uppercase tracking-wider text-xs hover:bg-gray-300 transition-colors rounded-xs cursor-pointer"
              >
                Return to Index
              </button>
            </div>
          </div>
        ) : is404 ? (
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
          <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="w-full h-10 bg-gray-300 rounded"></div>
              <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4 py-3 border-y border-gray-200">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-36 h-3 bg-gray-300 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-full h-96 bg-gray-200 rounded"></div>
            <div className="space-y-3 pt-4">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            </div>
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
