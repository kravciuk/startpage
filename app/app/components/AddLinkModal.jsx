'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddLinkModal({ isOpen, onClose, onSubmit, editLink = null }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editLink;

  useEffect(() => {
    if (editLink) {
      setTitle(editLink.title || '');
      setUrl(editLink.url || '');
    } else {
      setTitle('');
      setUrl('');
    }
  }, [editLink, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    await onSubmit({
      title: title.trim(),
      url: url.trim(),
    });
    setIsSubmitting(false);
    setTitle('');
    setUrl('');
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
          <h2 className="text-lg font-semibold text-text-primary">
            {isEditing ? 'Редактировать ссылку' : 'Добавить ссылку'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Название сайта
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Google"
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
            
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Адрес сайта
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={url.replace(/^https?:\/\//, '')}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="
                    w-full h-11 pl-[72px] pr-4 rounded-xl
                    bg-bg-input border border-border-subtle
                    text-text-primary placeholder-text-muted
                    focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]
                    transition-all
                  "
                />
              </div>
            </div>
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
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !url.trim() || isSubmitting}
              className="
                flex-1 h-10 rounded-lg bg-accent
                text-white text-sm font-medium
                hover:bg-accent-hover transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
