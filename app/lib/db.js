import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Resolve database path
// In Docker, it should be mounted to /app/data
const dbDir = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'startpage.db');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath, { verbose: console.log });

// Enable Write-Ahead Logging (WAL) for better concurrency
db.pragma('journal_mode = WAL');
// Enable Foreign Keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    cards_per_row INTEGER NOT NULL DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    favicon_path TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(block_id) REFERENCES blocks(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_links_block_id ON links(block_id);
  CREATE INDEX IF NOT EXISTS idx_blocks_sort_order ON blocks(sort_order);
  CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);
`);

// Migration: add cards_per_row if missing
const blockColumns = db.prepare("PRAGMA table_info(blocks)").all();
if (!blockColumns.some(col => col.name === 'cards_per_row')) {
  db.exec("ALTER TABLE blocks ADD COLUMN cards_per_row INTEGER NOT NULL DEFAULT 2");
}

// Seed default data if database is empty
const countBlocks = db.prepare('SELECT COUNT(*) as count FROM blocks').get();

if (countBlocks.count === 0) {
  console.log('Seeding initial database data...');
  
  // Start transaction
  const insertTransaction = db.transaction(() => {
    const insertBlock = db.prepare('INSERT INTO blocks (name, sort_order) VALUES (?, ?)');
    const insertLink = db.prepare('INSERT INTO links (block_id, title, url, sort_order) VALUES (?, ?, ?, ?)');
    
    // Insert AI Services block
    const blockResult = insertBlock.run('AI Сервисы', 0);
    const blockId = blockResult.lastInsertRowid;
    
    // Insert default links
    const defaultLinks = [
      { title: 'ChatGPT', url: 'https://chatgpt.com', sort_order: 0 },
      { title: 'Claude', url: 'https://claude.ai', sort_order: 1 },
      { title: 'Gemini', url: 'https://gemini.google.com', sort_order: 2 },
      { title: 'Copilot', url: 'https://copilot.microsoft.com', sort_order: 3 },
      { title: 'Perplexity', url: 'https://perplexity.ai', sort_order: 4 },
      { title: 'Midjourney', url: 'https://midjourney.com', sort_order: 5 },
      { title: 'Hugging Face', url: 'https://huggingface.co', sort_order: 6 },
      { title: 'Anthropic', url: 'https://anthropic.com', sort_order: 7 },
      { title: 'OpenAI', url: 'https://openai.com', sort_order: 8 },
      { title: 'Grok', url: 'https://grok.x.ai', sort_order: 9 }
    ];
    
    defaultLinks.forEach((link) => {
      insertLink.run(blockId, link.title, link.url, link.sort_order);
    });
  });
  
  insertTransaction();
  console.log('Seeding completed successfully!');
}

export default db;
