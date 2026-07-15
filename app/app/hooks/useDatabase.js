'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDatabase() {
  const [blocks, setBlocks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data from the SQLite API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/blocks');
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setBlocks(data);
        }
      } catch (error) {
        console.error('Failed to load blocks from API:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const createBlock = useCallback(async (name, cardsPerRow = 2) => {
    const tempId = 'temp-' + Date.now();

    // Optimistic UI update
    setBlocks((prev) => {
      const maxOrder = Math.max(...prev.map((b) => b.sort_order), -1);
      return [
        ...prev,
        {
          id: tempId,
          name,
          sort_order: maxOrder + 1,
          cards_per_row: cardsPerRow,
          links: [],
        },
      ];
    });

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cards_per_row: cardsPerRow }),
      });
      if (res.ok) {
        const realBlock = await res.json();
        // Replace temp ID with real ID
        setBlocks((prev) =>
          prev.map((b) => (b.id === tempId ? realBlock : b))
        );
      }
    } catch (error) {
      console.error('Failed to create block:', error);
      // Revert change
      setBlocks((prev) => prev.filter((b) => b.id !== tempId));
    }
  }, []);

  const updateBlock = useCallback(async (id, name, cardsPerRow = 2) => {
    let originalBlock = null;
    // Optimistic UI update
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          originalBlock = { ...b };
          return { ...b, name, cards_per_row: cardsPerRow };
        }
        return b;
      })
    );

    try {
      const res = await fetch(`/api/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cards_per_row: cardsPerRow }),
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to update block:', error);
      // Revert block
      setBlocks((prev) =>
        prev.map((b) => (b.id === id && originalBlock ? originalBlock : b))
      );
    }
  }, []);

  const deleteBlock = useCallback(async (id) => {
    let deletedBlock = null;
    // Optimistic UI update
    setBlocks((prev) => {
      deletedBlock = prev.find((b) => b.id === id);
      return prev.filter((b) => b.id !== id);
    });

    try {
      const res = await fetch(`/api/blocks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to delete block:', error);
      // Revert deletion
      if (deletedBlock) {
        setBlocks((prev) => [...prev, deletedBlock].sort((a, b) => a.sort_order - b.sort_order));
      }
    }
  }, []);

  const reorderBlocks = useCallback(async (blockIds) => {
    let originalBlocks = [];
    // Optimistic UI update
    setBlocks((prev) => {
      originalBlocks = [...prev];
      const blockMap = new Map(prev.map((b) => [b.id, b]));
      return blockIds
        .map((id) => blockMap.get(id))
        .filter(Boolean)
        .map((b, i) => ({ ...b, sort_order: i }));
    });

    try {
      const res = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds }),
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to reorder blocks:', error);
      // Revert order
      setBlocks(originalBlocks);
    }
  }, []);

  const createLink = useCallback(async (blockId, title, url) => {
    const tempId = 'temp-' + Date.now();
    
    // Optimistic UI update
    setBlocks((prev) => {
      return prev.map((block) => {
        if (block.id === blockId) {
          const maxOrder = Math.max(...block.links.map((l) => l.sort_order), -1);
          const newLink = {
            id: tempId,
            block_id: blockId,
            title,
            url,
            favicon_path: null,
            sort_order: maxOrder + 1,
          };
          return {
            ...block,
            links: [...block.links, newLink],
          };
        }
        return block;
      });
    });

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, title, url }),
      });
      
      if (res.ok) {
        const realLink = await res.json();
        // Replace temp ID with real ID in blocks state
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? {
                  ...b,
                  links: b.links.map((l) => (l.id === tempId ? realLink : l)),
                }
              : b
          )
        );
        return realLink.id;
      }
    } catch (error) {
      console.error('Failed to create link:', error);
      // Revert link insertion
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, links: b.links.filter((l) => l.id !== tempId) }
            : b
        )
      );
    }
    return null;
  }, []);

  const updateLink = useCallback(async (id, updates) => {
    let originalLink = null;
    
    // Optimistic UI update
    setBlocks((prev) =>
      prev.map((block) => {
        const linkExists = block.links.some((l) => l.id === id);
        if (linkExists) {
          return {
            ...block,
            links: block.links.map((l) => {
              if (l.id === id) {
                originalLink = { ...l };
                return { ...l, ...updates };
              }
              return l;
            }),
          };
        }
        return block;
      })
    );

    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to update link:', error);
      // Revert link details
      if (originalLink) {
        setBlocks((prev) =>
          prev.map((block) => ({
            ...block,
            links: block.links.map((l) => (l.id === id ? originalLink : l)),
          }))
        );
      }
    }
  }, []);

  const deleteLink = useCallback(async (id) => {
    let deletedLink = null;
    let blockId = null;

    // Optimistic UI update
    setBlocks((prev) =>
      prev.map((block) => {
        const link = block.links.find((l) => l.id === id);
        if (link) {
          deletedLink = link;
          blockId = block.id;
          return {
            ...block,
            links: block.links.filter((l) => l.id !== id),
          };
        }
        return block;
      })
    );

    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to delete link:', error);
      // Revert deletion
      if (deletedLink && blockId !== null) {
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  links: [...block.links, deletedLink].sort((a, b) => a.sort_order - b.sort_order),
                }
              : block
          )
        );
      }
    }
  }, []);

  const reorderLinks = useCallback(async (orderedIds, targetBlockId) => {
    let originalBlocks = [];

    // Optimistic UI update
    setBlocks((prev) => {
      originalBlocks = JSON.parse(JSON.stringify(prev)); // Deep copy to safely revert if API fails
      
      const allLinks = prev.flatMap((b) => b.links);
      const linkMap = new Map(allLinks.map((l) => [l.id, l]));

      return prev.map((block) => {
        if (block.id === targetBlockId) {
          const blockLinks = orderedIds
            .map((id) => linkMap.get(id))
            .filter(Boolean)
            .map((l, i) => ({ ...l, block_id: targetBlockId, sort_order: i }));
          return { ...block, links: blockLinks };
        }
        return {
          ...block,
          links: block.links.filter((l) => !orderedIds.includes(l.id)),
        };
      });
    });

    try {
      const res = await fetch('/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds, targetBlockId }),
      });
      if (!res.ok) throw new Error('API error');
    } catch (error) {
      console.error('Failed to reorder links:', error);
      // Revert block layout
      setBlocks(originalBlocks);
    }
  }, []);

  return {
    blocks,
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
