'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-[600px] mx-auto mb-10">
      <div
        className={`
          relative flex items-center h-12 rounded-xl border transition-all duration-200
          ${isFocused 
            ? 'border-accent shadow-[0_0_0_3px_rgba(79,70,229,0.15)]' 
            : 'border-border-subtle bg-bg-input'
          }
        `}
      >
        <Search 
          className="absolute left-4 w-[18px] h-[18px] text-text-muted pointer-events-none" 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Поиск по названию или адресу..."
          className="
            w-full h-full bg-transparent pl-11 pr-10
            text-[15px] text-text-primary placeholder-text-muted
            outline-none border-none rounded-xl
          "
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
