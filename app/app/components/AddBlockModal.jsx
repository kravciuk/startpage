'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddBlockModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [cardsPerRow, setCardsPerRow] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(name.trim(), cardsPerRow);
    setIsSubmitting(false);
    setName('');
    setCardsPerRow(2);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-up"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-[420px] mx-4 bg-bg-block border border-border-subtle rounded-2xl p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary">New block</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm text-text-secondary mb-2">
              Block name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work"
              autoFocus
              className="
                w-full h-11 px-4 rounded-xl
                bg-bg-input border border-border-subtle
                text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]
                transition-all
              "
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-text-secondary mb-2">
              Cards per row
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={cardsPerRow}
              onChange={(e) => setCardsPerRow(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 4))}
              className="
                w-full h-11 px-4 rounded-xl
                bg-bg-input border border-border-subtle
                text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]
                transition-all
              "
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 h-10 rounded-lg border border-border-subtle
                text-text-primary text-sm font-medium
                hover:bg-white/5 transition-colors
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="
                flex-1 h-10 rounded-lg bg-accent
                text-white text-sm font-medium
                hover:bg-accent-hover transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
