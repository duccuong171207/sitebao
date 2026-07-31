import React, { useState } from 'react';
import { Search, UserCheck, Menu, X, Shield, Globe, Clock, Lock } from 'lucide-react';
import { Category } from '../types';
import { VerifiedAuthor } from './VerifiedAuthor';

interface HeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenLegal: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  isStoryPage?: boolean;
}

const CATEGORIES: (Category | 'All' | 'Latest')[] = [
  'Latest',
  'World',
  'Business',
  'Markets',
  'Technology',
  'Culture',
  'Politics',
  'Lifestyle',
  'Analysis',
  'Opinion'
];

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAdmin,
  onOpenLegal,
  isAdminLoggedIn,
  onLogoutAdmin,
  isStoryPage = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentDateStr = new Date('2026-07-31T10:30:00-07:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="bg-[#FCFAF7] border-b border-black/10 sticky top-0 z-40">
      {/* Top Utility Header */}
      <div className="border-b border-black/10 text-[11px] py-2 px-4 sm:px-6 text-[#1A1A1A] font-bold uppercase tracking-widest">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Date & Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <span>{currentDateStr}</span>
            <span className="hidden sm:inline text-black/50 font-normal">
              Edition: Global & US
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-black/70 font-normal">
              <span>Publisher:</span>
              <VerifiedAuthor name="Luiis David" size="sm" />
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={onOpenSearch}
              className="hover:opacity-60 cursor-pointer flex items-center gap-1.5 transition-opacity"
            >
              <Search size={13} />
              <span>Search</span>
            </button>

            <button 
              onClick={onOpenLegal}
              className="hover:opacity-60 cursor-pointer hidden sm:flex items-center gap-1 transition-opacity text-black/70 font-normal"
            >
              <Shield size={12} />
              Rights & Copyright
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onOpenAdmin}
                  className="bg-black text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 cursor-pointer hover:bg-black/80 transition-colors"
                >
                  <UserCheck size={11} />
                  Publisher CMS
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-red-700 hover:underline cursor-pointer text-[10px] font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="opacity-70 hover:opacity-100 cursor-pointer flex items-center gap-1 transition-opacity text-[11px] font-normal"
                title="Luiis David Publisher Access"
              >
                <Lock size={11} />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand Masthead - Hidden on individual Story pages */}
      {!isStoryPage && (
        <div className="py-7 px-4 sm:px-6 text-center bg-[#FCFAF7] border-b border-[#111111]">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative">
            {/* Mobile Menu Toggle Button */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-black hover:bg-black/5 rounded-none cursor-pointer border border-black/20"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* Main Title Masthead */}
            <button 
              onClick={() => onSelectCategory('Latest')}
              className="group cursor-pointer text-center focus:outline-hidden"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-masthead font-black tracking-tight leading-none text-[#111111] uppercase group-hover:opacity-85 transition-opacity">
                THE DAILY LEDGER
              </h1>
              <p className="text-[10px] sm:text-[11px] tracking-[0.28em] mt-2.5 font-bold uppercase text-[#111111] font-sans-ui border-t border-b border-black/30 py-1 inline-block">
                Independent Digital Publication • Published by Luiis David
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Topic Navigation Category Bar */}
      <nav className="flex justify-start md:justify-center overflow-x-auto border-t border-b border-black py-2.5 px-4 sm:px-6 bg-[#FCFAF7] scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-5 sm:gap-6 lg:gap-8 text-[12px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat || (selectedCategory === 'All' && cat === 'Latest');
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat === 'Latest' ? 'All' : cat)}
                className={`cursor-pointer transition-all shrink-0 ${
                  isSelected
                    ? 'border-b-2 border-black pb-0.5 text-black'
                    : 'text-black/70 hover:opacity-100 hover:text-black'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FCFAF7] border-b border-black px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-black/10 pb-1">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px] font-bold uppercase tracking-wider">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat === 'Latest' ? 'All' : cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-1.5 px-2 rounded-xs cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-black/5 text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="border-t border-black/10 pt-3 flex flex-col gap-2 text-xs">
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-gray-800 py-1.5 font-bold uppercase text-[11px]"
            >
              <Search size={15} /> Search Articles
            </button>
            <button
              onClick={() => {
                onOpenLegal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-gray-800 py-1.5 font-bold uppercase text-[11px]"
            >
              <Shield size={15} /> Rights & Legal Information
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
