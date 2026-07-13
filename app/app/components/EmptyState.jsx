'use client';

import { LayoutGrid, Plus } from 'lucide-react';

export default function EmptyState({ onCreateBlock }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LayoutGrid className="w-16 h-16 text-text-muted" />
      <p className="text-base text-text-secondary">
        У вас пока нет блоков быстрого доступа
      </p>
      <p className="text-sm text-text-muted">
        Создайте первый блок, чтобы начать
      </p>
      <button
        onClick={onCreateBlock}
        className="
          flex items-center gap-2 mt-4 px-5 py-2.5
          bg-accent text-white rounded-lg
          text-sm font-medium
          hover:bg-accent-hover transition-colors
        "
      >
        <Plus className="w-4 h-4" />
        Создать блок
      </button>
    </div>
  );
}
