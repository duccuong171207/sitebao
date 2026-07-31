import React from 'react';

interface VerifiedAuthorProps {
  name?: string;
  role?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
}

export const VerifiedAuthor: React.FC<VerifiedAuthorProps> = ({
  name = 'Luiis David',
  role = 'Publisher / Editor',
  className = '',
  size = 'md',
  showRole = false
}) => {
  // Check if author is official Luiis David or contains Luiis David
  const isOfficial = !name || name.toLowerCase().includes('luiis david');
  const displayName = isOfficial ? 'Luiis David' : name;

  const badgeSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-[11px]',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight text-[#111111] ${textSizeClasses[size]} ${className}`}>
      <span className="truncate">{displayName}</span>
      
      {/* Official Verified Blue Badge */}
      <svg 
        className={`${badgeSizeClasses[size]} text-[#1D9BF0] fill-current shrink-0 inline-block align-middle`} 
        viewBox="0 0 24 24" 
        aria-label="Verified Publisher Account"
        title="Official Verified Publisher — Luiis David"
      >
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.475 9.55.6 10.92.6 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zM9.8 17.3l-4.2-4.2 1.4-1.4 2.8 2.8 7.4-7.4 1.4 1.4-8.8 8.8z" />
      </svg>

      {showRole && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 font-sans-ui ml-1">
          • {role}
        </span>
      )}
    </span>
  );
};
