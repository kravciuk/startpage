import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// PATCH /api/links/[id] - Update a link
export async function PATCH(request, { params }) {
  try {
    const db = getDb();
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, url, favicon_path } = body;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (favicon_path !== undefined) {
      updates.push('favicon_path = ?');
      values.push(favicon_path);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const result = db.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Get the updated link
    const updatedLink = db.prepare('SELECT * FROM links WHERE id = ?').get(id);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/links/[id] - Delete a link
export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const id = parseInt(params.id);

    const result = db.prepare('DELETE FROM links WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
