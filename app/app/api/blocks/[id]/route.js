import { NextResponse } from 'next/server';
import db from '@/lib/db';

// PATCH /api/blocks/[id] - Rename a block
export async function PATCH(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = db.prepare('UPDATE blocks SET name = ? WHERE id = ?').run(name, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, name });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/blocks/[id] - Delete a block and its links (cascaded automatically by SQLite foreign key ON DELETE CASCADE)
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    const result = db.prepare('DELETE FROM blocks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
