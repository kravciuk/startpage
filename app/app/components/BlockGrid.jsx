'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import QuickBlock from './QuickBlock';
import AddBlockButton from './AddBlockButton';
import LinkCard from './LinkCard';

export default function BlockGrid({
  blocks,
  onBlocksChange,
  onEditLink,
  onDeleteLink,
  onAddLink,
  onRenameBlock,
  onDeleteBlock,
  onAddBlock,
  allBlocks,
  onReorderLinks,
}) {
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeData, setActiveData] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const { active } = event;
        const node = active?.rect?.current?.translated;
        return node ? { x: node.left, y: node.top } : { x: 0, y: 0 };
      },
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveType(active.data.current?.type);
    setActiveData(active.data.current);
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    // Handle link dragging over another block
    if (activeIdStr.startsWith('link-') && overIdStr.startsWith('block-')) {
      const overBlockId = parseInt(overIdStr.replace('block-', ''));
      const activeLinkId = parseInt(activeIdStr.replace('link-', ''));

      // Check if link is already in target block
      const targetBlock = allBlocks.find(b => b.id === overBlockId);
      if (targetBlock && targetBlock.links.some(l => l.id === activeLinkId)) {
        return; // Already in this block
      }

      // Move link to target block (append at end)
      const sourceBlock = allBlocks.find(b => b.links.some(l => l.id === activeLinkId));
      if (!sourceBlock || sourceBlock.id === overBlockId) return;

      const link = sourceBlock.links.find(l => l.id === activeLinkId);
      if (!link) return;

      // Update blocks visually
      onBlocksChange((prevBlocks) => {
        return prevBlocks.map((block) => {
          if (block.id === sourceBlock.id) {
            return { ...block, links: block.links.filter(l => l.id !== activeLinkId) };
          }
          if (block.id === overBlockId) {
            return { ...block, links: [...block.links, { ...link, block_id: overBlockId }] };
          }
          return block;
        });
      });
    }
  }, [allBlocks, onBlocksChange]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);
    setActiveData(null);

    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    // Handle block reordering
    if (activeIdStr.startsWith('block-') && overIdStr.startsWith('block-')) {
      const activeBlockId = parseInt(activeIdStr.replace('block-', ''));
      const overBlockId = parseInt(overIdStr.replace('block-', ''));

      if (activeBlockId !== overBlockId) {
        const blockIds = blocks.map(b => b.id);
        const oldIndex = blockIds.indexOf(activeBlockId);
        const newIndex = blockIds.indexOf(overBlockId);
        const newOrder = arrayMove(blockIds, oldIndex, newIndex);
        onBlocksChange(newOrder);
      }
    }

    // Handle link reordering within a block
    if (activeIdStr.startsWith('link-') && overIdStr.startsWith('link-')) {
      const activeLinkId = parseInt(activeIdStr.replace('link-', ''));
      const overLinkId = parseInt(overIdStr.replace('link-', ''));

      if (activeLinkId !== overLinkId) {
        // Find which block contains these links
        const targetBlock = blocks.find(b => 
          b.links.some(l => l.id === activeLinkId) && 
          b.links.some(l => l.id === overLinkId)
        );

        if (targetBlock) {
          const linkIds = targetBlock.links.map(l => l.id);
          const oldIndex = linkIds.indexOf(activeLinkId);
          const newIndex = linkIds.indexOf(overLinkId);
          const newOrder = arrayMove(linkIds, oldIndex, newIndex);
          onReorderLinks(newOrder, targetBlock.id);
        } else {
          // Link moved to different block - find the block with the target link
          const targetBlockWithOver = blocks.find(b => 
            b.links.some(l => l.id === overLinkId)
          );
          if (targetBlockWithOver) {
            // Get the moved link
            const movedLink = blocks.flatMap(b => b.links).find(l => l.id === activeLinkId);
            if (movedLink) {
              const newOrder = [...targetBlockWithOver.links.map(l => l.id), activeLinkId];
              onReorderLinks(newOrder, targetBlockWithOver.id);
            }
          }
        }
      }
    }
  }, [blocks, onBlocksChange, onReorderLinks]);

  // Find active block/link for overlay
  const activeBlock = activeType === 'block' 
    ? blocks.find((b) => b.id === activeData?.block?.id)
    : null;
  const activeLink = activeType === 'link'
    ? blocks.flatMap((b) => b.links).find((l) => l.id === activeData?.link?.id)
    : null;

  // Split blocks into rows of 3
  const COLS = 3;
  const rows = [];
  for (let i = 0; i < blocks.length; i += COLS) {
    rows.push(blocks.slice(i, i + COLS));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => `block-${b.id}`)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-col gap-5">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col sm:flex-row items-stretch gap-5">
              {row.map((block) => {
                const cards = block.cards_per_row || 2;
                return (
                  <div
                    key={block.id}
                    className="flex flex-col min-w-0 w-full sm:w-auto"
                    style={{ flex: `${cards} 1 0` }}
                  >
                    <QuickBlock
                      block={block}
                      onEditLink={onEditLink}
                      onDeleteLink={onDeleteLink}
                      onAddLink={onAddLink}
                      onRenameBlock={onRenameBlock}
                      onDeleteBlock={onDeleteBlock}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <AddBlockButton onClick={onAddBlock} />
        </div>
      </SortableContext>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeType === 'block' && activeBlock && (
          <QuickBlock
            block={activeBlock}
            onEditLink={onEditLink}
            onDeleteLink={onDeleteLink}
            onAddLink={onAddLink}
            onRenameBlock={onRenameBlock}
            onDeleteBlock={onDeleteBlock}
            isOverlay
          />
        )}
        {activeId && activeType === 'link' && activeLink && (
          <LinkCard
            link={activeLink}
            onEdit={onEditLink}
            onDelete={onDeleteLink}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
