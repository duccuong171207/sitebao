import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Detect if content contains HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtml) {
    return (
      <div 
        className={`font-serif-body leading-relaxed text-gray-900 article-html-content space-y-5 ${className}`} 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  // Split content by double linebreaks or multiple empty lines into paragraphs/blocks
  const blocks = content.split(/\r?\n\r?\n+/);

  return (
    <div className={`space-y-5 text-gray-900 font-serif-body leading-relaxed ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1 (# Title)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="font-serif-headline text-2xl sm:text-3xl font-bold text-[#111111] mt-8 mb-4 border-b-2 border-black pb-2">
              {trimmed.substring(2)}
            </h1>
          );
        }

        // Heading 2 (## Subheading)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="font-serif-headline text-xl sm:text-2xl font-bold text-[#111111] mt-7 mb-3 border-b border-gray-300 pb-1.5">
              {trimmed.substring(3)}
            </h2>
          );
        }

        // Heading 3 (### Sub-subheading)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="font-serif-headline text-lg sm:text-xl font-bold text-[#111111] mt-6 mb-2">
              {trimmed.substring(4)}
            </h3>
          );
        }

        // Blockquote (> Quote text)
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={i} className="font-serif-headline text-lg font-semibold italic border-l-4 border-[#990000] pl-4 py-2.5 bg-[#f8f6f0] text-gray-800 my-5 rounded-r-xs shadow-2xs">
              {trimmed.substring(2)}
            </blockquote>
          );
        }

        // Unordered Bullet List
        if (trimmed.split('\n').every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = trimmed.split('\n').map(l => l.trim().replace(/^[-*]\s+/, ''));
          return (
            <ul key={i} className="list-disc list-inside space-y-2 my-4 pl-2 text-gray-900 font-serif-body">
              {items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          );
        }

        // Numbered List
        if (trimmed.split('\n').every(line => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split('\n').map(l => l.trim().replace(/^\d+\.\s+/, ''));
          return (
            <ol key={i} className="list-decimal list-inside space-y-2 my-4 pl-2 text-gray-900 font-serif-body">
              {items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{renderInlineFormatting(item)}</li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph with single linebreaks preserved as <br />
        const lines = trimmed.split(/\r?\n/);
        return (
          <p key={i} className="leading-relaxed text-[#111111] text-base sm:text-lg mb-5">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineFormatting(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-black">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
