'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'startpage_data';

// Initial seed data
const INITIAL_DATA = {
  blocks: [
    {
      id: 1,
      name: 'AI Сервисы',
      sort_order: 0,
      links: [
        { id: 1, block_id: 1, title: 'ChatGPT', url: 'https://chatgpt.com', favicon_path: null, sort_order: 0 },
        { id: 2, block_id: 1, title: 'Claude', url: 'https://claude.ai', favicon_path: null, sort_order: 1 },
        { id: 3, block_id: 1, title: 'Gemini', url: 'https://gemini.google.com', favicon_path: null, sort_order: 2 },
        { id: 4, block_id: 1, title: 'Copilot', url: 'https://copilot.microsoft.com', favicon_path: null, sort_order: 3 },
        { id: 5, block_id: 1, title: 'Perplexity', url: 'https://perplexity.ai', favicon_path: null, sort_order: 4 },
        { id: 6, block_id: 1, title: 'Midjourney', url: 'https://midjourney.com', favicon_path: null, sort_order: 5 },
        { id: 7, block_id: 1, title: 'Hugging Face', url: 'https://huggingface.co', favicon_path: null, sort_order: 6 },
        { id: 8, block_id: 1, title: 'Anthropic', url: 'https://anthropic.com', favicon_path: null, sort_order: 7 },
        { id: 9, block_id: 1, title: 'OpenAI', url: 'https://openai.com', favicon_path: null, sort_order: 8 },
        { id: 10, block_id: 1, title: 'Grok', url: 'https://grok.x.ai', favicon_path: null, sort_order: 9 },
      ],
    },
  ],
  nextBlockId: 2,
  nextLinkId: 11,
};

function loadData() {
  if (typeof window === 'undefined') return INITIAL_DATA;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  return INITIAL_DATA;
}

function saveData(data) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function useLocalStorage() {
  const [data, setData] = useState(() => loadData());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto-save on change
  useEffect(() => {
    if (isLoaded) {
      saveData(data);
    }
  }, [data, isLoaded]);

  const getBlocks = useCallback(() => {
    return data.blocks;
  }, [data.blocks]);

  const createBlock = useCallback((name) => {
    setData((prev) => {
      const maxOrder = Math.max(...prev.blocks.map((b) => b.sort_order), -1);
      const newBlock = {
        id: prev.nextBlockId,
        name,
        sort_order: maxOrder + 1,
        links: [],
      };
      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        nextBlockId: prev.nextBlockId + 1,
      };
    });
  }, []);

  const updateBlock = useCallback((id, name) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, name } : b)),
    }));
  }, []);

  const deleteBlock = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
  }, []);

  const reorderBlocks = useCallback((blockIds) => {
    setData((prev) => {
      const blockMap = new Map(prev.blocks.map((b) => [b.id, b]));
      const reordered = blockIds
        .map((id) => blockMap.get(id))
        .filter(Boolean)
        .map((b, i) => ({ ...b, sort_order: i }));
      return {
        ...prev,
        blocks: reordered,
      };
    });
  }, []);

  const createLink = useCallback((blockId, title, url) => {
    setData((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      if (!block) return prev;
      
      const maxOrder = Math.max(...block.links.map((l) => l.sort_order), -1);
      const newLink = {
        id: prev.nextLinkId,
        block_id: blockId,
        title,
        url,
        favicon_path: null,
        sort_order: maxOrder + 1,
      };
      
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, links: [...b.links, newLink] } : b
        ),
        nextLinkId: prev.nextLinkId + 1,
      };
    });
    
    // Return the created link id for favicon fetching
    return data.nextLinkId;
  }, [data.nextLinkId]);

  const updateLink = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => ({
        ...b,
        links: b.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      })),
    }));
  }, []);

  const deleteLink = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => ({
        ...b,
        links: b.links.filter((l) => l.id !== id),
      })),
    }));
  }, []);

  const reorderLinks = useCallback((orderedIds, targetBlockId) => {
    setData((prev) => {
      // Collect all links
      const allLinks = prev.blocks.flatMap((b) => b.links);
      const linkMap = new Map(allLinks.map((l) => [l.id, l]));
      
      // Build new blocks
      const newBlocks = prev.blocks.map((block) => {
        if (block.id === targetBlockId) {
          const blockLinks = orderedIds
            .map((id) => linkMap.get(id))
            .filter(Boolean)
            .map((l, i) => ({ ...l, block_id: targetBlockId, sort_order: i }));
          return { ...block, links: blockLinks };
        }
        // Remove moved links from other blocks
        return {
          ...block,
          links: block.links.filter((l) => !orderedIds.includes(l.id)),
        };
      });
      
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  return {
    blocks: data.blocks,
    isLoaded,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
  };
}
