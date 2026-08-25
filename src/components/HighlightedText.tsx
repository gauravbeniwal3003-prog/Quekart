import React from 'react';

interface HighlightedTextProps {
  text: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  query = '',
  className = '',
  highlightClassName = 'bg-amber-200/80 text-slate-950 font-extrabold px-0.5 rounded-xs border-b-2 border-amber-400',
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const rawQuery = query.trim();
  const rawTokens = rawQuery
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (rawTokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedTokens = rawTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  // Combine query and tokens sorted by length descending so longer sub-phrases match first
  const uniquePatterns = Array.from(new Set([escapedQuery, ...escapedTokens])).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${uniquePatterns.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = rawTokens.some((t) => part.toLowerCase() === t.toLowerCase()) || part.toLowerCase() === rawQuery.toLowerCase();
        return isMatch ? (
          <mark key={index} className={`bg-transparent ${highlightClassName}`}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
};

export default HighlightedText;

