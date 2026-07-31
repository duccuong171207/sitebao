import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Category, LegalDocType } from '../types';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenLegal: (type?: LegalDocType) => void;
  onOpenAdmin: () => void;
}

const FOOTER_CATEGORIES: Category[] = [
  'World', 'Business', 'Markets', 'Technology', 'Politics', 'Culture', 'Lifestyle', 'Analysis', 'Opinion'
];

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenLegal,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-black text-white border-t border-black font-sans pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Brand & Editorial Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div>
            <h2 className="font-serif-masthead text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              THE DAILY LEDGER
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mt-1 font-bold font-sans-ui">
              An Independent Digital Publication • Published by Luiis David
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => onOpenLegal('copyright')}
              className="bg-white/10 hover:bg-white/20 text-gray-100 px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Shield size={14} className="text-amber-400" />
              Rights & Copyright
            </button>
            <button
              onClick={onOpenAdmin}
              className="bg-white/10 hover:bg-white/20 text-gray-100 px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Lock size={13} className="text-gray-300" />
              Publisher Login
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-sans">
          
          {/* Column 1: News Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#990000] border-b border-white/10 pb-1">
              Ledger Sections
            </h3>
            <ul className="space-y-2 text-gray-300 font-bold uppercase text-[11px] tracking-wider">
              {FOOTER_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {cat} Stories
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Analytical & Opinion */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#990000] border-b border-white/10 pb-1">
              Analysis & Opinion
            </h3>
            <ul className="space-y-2 text-gray-300 font-bold uppercase text-[11px] tracking-wider">
              {FOOTER_CATEGORIES.slice(5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#990000] border-b border-white/10 pb-1">
              Legal & Usage
            </h3>
            <ul className="space-y-2 text-gray-300 font-bold uppercase text-[11px] tracking-wider">
              <li>
                <button onClick={() => onOpenLegal('copyright')} className="hover:text-white cursor-pointer">
                  Copyright Notice
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-white cursor-pointer">
                  Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-white cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('content-usage')} className="hover:text-white cursor-pointer">
                  Content Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Photography & Rights */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#990000] border-b border-white/10 pb-1">
              Permissions
            </h3>
            <ul className="space-y-2 text-gray-300 font-bold uppercase text-[11px] tracking-wider">
              <li>
                <button onClick={() => onOpenLegal('image-usage')} className="hover:text-white cursor-pointer">
                  Image Usage
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('dmca')} className="hover:text-white cursor-pointer">
                  DMCA Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('rights')} className="hover:text-white cursor-pointer">
                  Rights & Claims
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('contact')} className="hover:text-white cursor-pointer">
                  Contact Bureau
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-sans gap-4">
          <div>
            <strong className="text-white">© Luiis David — All Rights Reserved.</strong>
          </div>
          <p className="text-[11px] text-gray-400 text-center sm:text-right max-w-md uppercase tracking-wider">
            THE DAILY LEDGER is an independent digital publication published by Luiis David. Protected under international copyright law.
          </p>
        </div>

      </div>
    </footer>
  );
};
