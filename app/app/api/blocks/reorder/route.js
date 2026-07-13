import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/blocks/reorder - Update blocks sort order
export async function POST(request) {
  try {
    const { blockIds } = await request.json();
    if (!Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'blockIds must be an array' }, { status: 400 });
    }

    // Run in a database transaction
    const updateTransaction = db.transaction((ids) => {
      const updateStmt = db.prepare('UPDATE blocks SET sort_order = ? WHERE id = ?');
      ids.forEach((id, index) => {
        updateStmt.run(index, id);
      });
    });

    updateTransaction(blockIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
