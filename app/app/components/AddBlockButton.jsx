'use client';

import { PlusCircle } from 'lucide-react';

export default function AddBlockButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2.5
        min-h-[200px] h-full
        border-2 border-dashed border-border-hover rounded-2xl
        text-text-muted transition-all duration-200
        hover:border-accent hover:text-accent hover:bg-accent/5
        ${className}
      `}
      >
      <PlusCircle className="w-8 h-8" />
      <span className="text-sm font-medium">New block</span>
    </button>
  );
}
