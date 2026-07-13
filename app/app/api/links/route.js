import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/links - Create a new link inside a block
export async function POST(request) {
  try {
    const { blockId, title, url } = await request.json();

    if (!blockId || !title || !url) {
      return NextResponse.json({ error: 'blockId, title, and url are required' }, { status: 400 });
    }

    // Check if block exists
    const block = db.prepare('SELECT id FROM blocks WHERE id = ?').get(blockId);
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Get max sort_order for links in this block
    const maxOrderRow = db.prepare('SELECT MAX(sort_order) as maxOrder FROM links WHERE block_id = ?')
      .get(blockId);
    const nextOrder = (maxOrderRow.maxOrder !== null ? maxOrderRow.maxOrder : -1) + 1;

    const result = db.prepare('INSERT INTO links (block_id, title, url, favicon_path, sort_order) VALUES (?, ?, ?, ?, ?)')
      .run(blockId, title, url, null, nextOrder);

    const newLink = {
      id: result.lastInsertRowid,
      block_id: blockId,
      title,
      url,
      favicon_path: null,
      sort_order: nextOrder,
    };

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
