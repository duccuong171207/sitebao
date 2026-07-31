import React, { useState } from 'react';
import { Shield, X, FileText, CheckCircle2 } from 'lucide-react';
import { LegalDocType } from '../types';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialType = 'copyright'
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fbfaf8] w-full max-w-4xl h-[85vh] rounded-xs border border-[#111111] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#111111] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            <h2 className="font-serif-headline text-lg font-bold">
              THE DAILY LEDGER — Legal & Rights Office
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Tab Navigation */}
          <div className="w-full md:w-64 bg-[#f3f0e8] border-r border-[#e2e0d8] p-3 space-y-1 overflow-y-auto shrink-0 font-sans text-xs font-semibold">
            <button
              onClick={() => setActiveTab('copyright')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'copyright' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Copyright Notice
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'terms' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Terms of Use
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'privacy' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('content-usage')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'content-usage' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Content Usage Policy
            </button>
            <button
              onClick={() => setActiveTab('image-usage')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'image-usage' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Image Usage Policy
            </button>
            <button
              onClick={() => setActiveTab('dmca')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'dmca' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> DMCA & Infringement
            </button>
            <button
              onClick={() => setActiveTab('rights')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'rights' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Rights & Permissions
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full text-left p-2.5 rounded-xs cursor-pointer flex items-center gap-2 transition-colors ${
                activeTab === 'contact' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              <FileText size={14} /> Contact Legal Office
            </button>
          </div>

          {/* Right Document Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white font-serif-body text-sm text-gray-800 space-y-4 leading-relaxed">
            
            {activeTab === 'copyright' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Official Copyright Notice
                </h3>
                <p className="font-bold text-[#990000]">
                  Copyright © Luiis David. All rights reserved.
                </p>
                <p>
                  All original articles, editorial reporting, photographs, graphics, audio, video, website design layouts, and proprietary code published on this website are the intellectual property of publisher <strong>Luiis David</strong> and are protected under applicable international copyright laws.
                </p>
                <p>
                  Unauthorized copying, reproduction, redistribution, republication, or commercial exploitation of protected content is strictly prohibited unless explicit written permission or a valid statutory legal exception applies.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Terms of Use
                </h3>
                <p>
                  Welcome to <strong>THE DAILY LEDGER</strong>, an independent digital publication published by <strong>Luiis David</strong>. By accessing this publication, you agree to comply with these Terms of Use. All content provided is for informational, educational, and journalistic purposes.
                </p>
                <p>
                  Visitors are prohibited from attempting to breach security, automated scraping without permission, or impersonating publisher personnel.
                </p>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Privacy Policy
                </h3>
                <p>
                  We respect reader privacy. We do not sell personal data or track readers across third-party websites. Interaction metrics (views, likes, comments) are processed securely for site analytics and reader engagement.
                </p>
              </div>
            )}

            {activeTab === 'content-usage' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Content Usage Policy
                </h3>
                <p>
                  Excerpts up to 100 words may be quoted for academic, commentary, or news reporting purposes provided full editorial attribution is given to <strong>Luiis David</strong> with a direct hyperlink to the original article.
                </p>
              </div>
            )}

            {activeTab === 'image-usage' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Image Usage & Photography Rights
                </h3>
                <p>
                  Photographs published with the copyright notice <strong>© Luiis David — All Rights Reserved</strong> are proprietary photography assets. Downloading, cropping, or using images for commercial publications without a license is strictly prohibited.
                </p>
              </div>
            )}

            {activeTab === 'dmca' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  DMCA & Copyright Infringement Notice
                </h3>
                <p>
                  If you believe material on this website infringes upon your copyright, please send a formal DMCA notice to our legal department detailing the copyrighted work and exact URL.
                </p>
              </div>
            )}

            {activeTab === 'rights' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Rights & Syndication Permissions
                </h3>
                <p>
                  For institutional licensing, article republication syndication, or photograph permissions, please submit a formal request to publisher <strong>Luiis David</strong>.
                </p>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="font-serif-headline text-xl font-bold text-[#111111] border-b pb-2">
                  Contact Legal Department
                </h3>
                <p>
                  <strong>Publisher & Rights Holder:</strong> Luiis David
                </p>
                <p>
                  <strong>Editorial Office:</strong> Luiis David International News Headquarters
                </p>
                <p>
                  <strong>Email:</strong> legal@luiisdavid.com
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
