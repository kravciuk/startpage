'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import LinkCard from './LinkCard';
import AddLinkButton from './AddLinkButton';

export default function QuickBlock({ 
  block, 
  onEditLink, 
  onDeleteLink, 
  onAddLink, 
  onRenameBlock, 
  onDeleteBlock,
  isOverlay,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `block-${block.id}`,
    data: {
      type: 'block',
      block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col h-full bg-bg-block border border-border-subtle rounded-2xl p-4 overflow-hidden',
        'transition-all duration-200',
        'hover:bg-bg-block-hover hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
        isDragging && 'dragging',
        isOverlay && 'opacity-70 border-2 border-accent shadow-xl rotate-1 z-50',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag handle for block */}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              'p-1 rounded cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <GripVertical className="w-4 h-4 text-text-muted" />
          </button>
          
          <h3 className="text-base font-semibold text-text-primary truncate">
            {block.name}
          </h3>
        </div>
        
        {/* Block Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-text-muted" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-bg-dropdown border border-border-subtle rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] py-1.5 animate-scale-in">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRenameBlock(block);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-white/5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Редактировать
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteBlock(block.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Удалить блок
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Links List */}
      <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto custom-scrollbar">
        <SortableContext
          items={block.links.map((l) => `link-${l.id}`)}
          strategy={rectSortingStrategy}
        >
          <div
            className="grid gap-1.5 w-full"
            style={{ gridTemplateColumns: `repeat(${isMobile ? Math.min(block.cards_per_row || 2, 2) : (block.cards_per_row || 2)}, minmax(0, 1fr))` }}
          >
            {block.links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Add Link Button */}
      <div className="mt-auto pt-3">
        <AddLinkButton onClick={() => onAddLink(block.id)} />
      </div>
    </div>
  );
}
