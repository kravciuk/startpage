'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BlockGrid from './components/BlockGrid';
import EmptyState from './components/EmptyState';
import AddBlockModal from './components/AddBlockModal';
import AddLinkModal from './components/AddLinkModal';
import RenameBlockModal from './components/RenameBlockModal';
import { useDatabase } from './hooks/useDatabase';
import { fetchBestFavicon } from './lib/favicon-client';

export default function Home() {
  const {
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
  } = useDatabase();

  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isRenameBlockOpen, setIsRenameBlockOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editLink, setEditLink] = useState(null);
  const [renameBlock, setRenameBlock] = useState(null);

  // Filter blocks when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBlocks(blocks);
      return;
    }

    const filtered = blocks
      .map((block) => ({
        ...block,
        links: block.links.filter(
          (link) =>
            link.title.toLowerCase().includes(searchQuery) ||
            link.url.toLowerCase().includes(searchQuery)
        ),
      }))
      .filter((block) => block.links.length > 0);

    setFilteredBlocks(filtered);
  }, [searchQuery, blocks]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Block operations
  const handleAddBlock = (name) => {
    createBlock(name);
  };

  const handleRenameBlock = (blockId, name) => {
    updateBlock(blockId, name);
  };

  const handleDeleteBlock = (blockId) => {
    if (!confirm('Удалить этот блок и все ссылки в нём?')) return;
    deleteBlock(blockId);
  };

  // Link operations
  const handleAddLink = (blockId) => {
    setSelectedBlockId(blockId);
    setEditLink(null);
    setIsAddLinkOpen(true);
  };

  const handleEditLink = (link) => {
    setSelectedBlockId(link.block_id);
    setEditLink(link);
    setIsAddLinkOpen(true);
  };

  const handleSubmitLink = async ({ title, url }) => {
    let linkUrl = url;
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      linkUrl = 'https://' + linkUrl;
    }

    if (editLink) {
      updateLink(editLink.id, { title, url: linkUrl });
      // Fetch new favicon if URL changed
      const faviconUrl = await fetchBestFavicon(linkUrl);
      if (faviconUrl) {
        updateLink(editLink.id, { favicon_path: faviconUrl });
      }
    } else {
      const newLinkId = await createLink(selectedBlockId, title, linkUrl);
      // Fetch favicon for new link
      const faviconUrl = await fetchBestFavicon(linkUrl);
      if (faviconUrl) {
        updateLink(newLinkId, { favicon_path: faviconUrl });
      }
    }
  };

  const handleDeleteLink = (linkId) => {
    if (!confirm('Удалить эту ссылку?')) return;
    deleteLink(linkId);
  };

  // Rename block modal
  const handleOpenRenameBlock = (block) => {
    setRenameBlock(block);
    setIsRenameBlockOpen(true);
  };

  // Fetch favicons for links without them
  useEffect(() => {
    if (!isLoaded) return;

    const fetchMissingFavicons = async () => {
      for (const block of blocks) {
        for (const link of block.links) {
          if (!link.favicon_path) {
            const faviconUrl = await fetchBestFavicon(link.url);
            if (faviconUrl) {
              updateLink(link.id, { favicon_path: faviconUrl });
            }
          }
        }
      }
    };

    fetchMissingFavicons();
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 sm:py-10">
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Content */}
        {blocks.length === 0 ? (
          <EmptyState onCreateBlock={() => setIsAddBlockOpen(true)} />
        ) : (
          <BlockGrid
            blocks={filteredBlocks}
            onBlocksChange={reorderBlocks}
            onEditLink={handleEditLink}
            onDeleteLink={handleDeleteLink}
            onAddLink={handleAddLink}
            onRenameBlock={handleOpenRenameBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddBlock={() => setIsAddBlockOpen(true)}
            allBlocks={blocks}
            onReorderLinks={reorderLinks}
          />
        )}
      </div>

      {/* Modals */}
      <AddBlockModal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        onSubmit={handleAddBlock}
      />

      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => {
          setIsAddLinkOpen(false);
          setEditLink(null);
          setSelectedBlockId(null);
        }}
        onSubmit={handleSubmitLink}
        editLink={editLink}
      />

      <RenameBlockModal
        isOpen={isRenameBlockOpen}
        onClose={() => {
          setIsRenameBlockOpen(false);
          setRenameBlock(null);
        }}
        onSubmit={handleRenameBlock}
        block={renameBlock}
      />
    </main>
  );
}
