'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export default function LinkCard({ link, onEdit, onDelete, isOverlay }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `link-${link.id}`,
    data: {
      type: 'link',
      link,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOpenLink = useCallback(() => {
    if (!isDragging) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }, [link.url, isDragging]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!showMenu && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 140 });
    }
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    onEdit(link);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    onDelete(link.id);
  };

  // Generate display URL
  let displayUrl = link.url;
  try {
    const urlObj = new URL(link.url);
    displayUrl = urlObj.hostname.replace(/^www\./, '');
  } catch {
    // keep original
  }

  // Generate background color from domain for fallback
  const getFallbackColor = (url) => {
    const colors = [
      '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
      '#ea580c', '#d97706', '#059669', '#0891b2', '#2563eb'
    ];
    let hash = 0;
    const str = displayUrl || url;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fallbackColor = getFallbackColor(link.url);
  const firstLetter = (displayUrl.charAt(0) || 'L').toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer overflow-hidden',
        'transition-all duration-150',
        'hover:bg-white/[0.03]',
        isDragging && 'opacity-50 border border-dashed border-accent',
        isOverlay && 'opacity-70 border-2 border-accent shadow-lg rotate-2',
      )}
      onClick={handleOpenLink}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'p-0.5 rounded cursor-grab active:cursor-grabbing transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {/* Favicon */}
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundColor: link.favicon_path && !imageError ? 'rgba(255,255,255,0.05)' : fallbackColor 
        }}
      >
        {link.favicon_path && !imageError ? (
          <img
            src={link.favicon_path}
            alt={link.title}
            className="w-5 h-5 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-white text-xs font-semibold">{firstLetter}</span>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {link.title}
        </div>
        <div className="text-[11px] text-text-secondary truncate">
          {displayUrl}
        </div>
      </div>

      {/* Menu Button */}
      <button
        ref={menuBtnRef}
        onClick={handleMenuClick}
        className={cn(
          'p-1 rounded-md transition-all flex-shrink-0',
          isHovered ? 'opacity-100' : 'opacity-0',
          'hover:bg-white/5'
        )}
      >
        <MoreVertical className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
          />
          <div
            className="fixed z-50 min-w-[140px] bg-bg-dropdown border border-border-subtle rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] py-1.5 animate-scale-in"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-white/5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Редактировать
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Удалить
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
