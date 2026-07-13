import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/links/reorder - Reorder links in a target block (handles both intra-block sort and inter-block movement)
export async function POST(request) {
  try {
    const { orderedIds, targetBlockId } = await request.json();

    if (!Array.isArray(orderedIds) || !targetBlockId) {
      return NextResponse.json({ error: 'orderedIds (array) and targetBlockId are required' }, { status: 400 });
    }

    // Run in a database transaction
    const updateTransaction = db.transaction((ids, blockId) => {
      const updateStmt = db.prepare('UPDATE links SET block_id = ?, sort_order = ? WHERE id = ?');
      ids.forEach((id, index) => {
        updateStmt.run(blockId, index, id);
      });
    });

    updateTransaction(orderedIds, targetBlockId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering links:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
