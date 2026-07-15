import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/blocks - Fetch all blocks with their links
export async function GET() {
  try {
    const blocks = db.prepare('SELECT * FROM blocks ORDER BY sort_order ASC').all();
    const links = db.prepare('SELECT * FROM links ORDER BY sort_order ASC').all();

    // Group links by block_id
    const blocksWithLinks = blocks.map((block) => {
      return {
        ...block,
        links: links.filter((link) => link.block_id === block.id),
      };
    });

    return NextResponse.json(blocksWithLinks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/blocks - Create a new block
export async function POST(request) {
  try {
    const { name, cards_per_row } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const cardsPerRow = Math.min(Math.max(parseInt(cards_per_row) || 2, 1), 4);

    // Get max sort_order
    const maxOrderRow = db.prepare('SELECT MAX(sort_order) as maxOrder FROM blocks').get();
    const nextOrder = (maxOrderRow.maxOrder !== null ? maxOrderRow.maxOrder : -1) + 1;

    const result = db.prepare('INSERT INTO blocks (name, sort_order, cards_per_row) VALUES (?, ?, ?)')
      .run(name, nextOrder, cardsPerRow);

    const newBlock = {
      id: result.lastInsertRowid,
      name,
      sort_order: nextOrder,
      cards_per_row: cardsPerRow,
      links: []
    };

    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
