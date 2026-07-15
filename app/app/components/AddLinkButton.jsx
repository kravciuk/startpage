'use client';

import { Plus } from 'lucide-react';

export default function AddLinkButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-2 py-3
        border border-dashed border-border-hover rounded-lg
        text-text-muted transition-all duration-150
        hover:border-accent hover:text-accent hover:bg-accent/5
      "
    >
      <Plus className="w-4 h-4" />
      <span className="text-[13px]">Add</span>
    </button>
  );
}
