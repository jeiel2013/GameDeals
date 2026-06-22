import * as SQLite from 'expo-sqlite';
import { SavedDeal } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('gamedeals.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS saved_deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dealID TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        salePrice TEXT NOT NULL,
        normalPrice TEXT NOT NULL,
        savings TEXT NOT NULL,
        thumb TEXT NOT NULL,
        savedAt TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function saveDeal(deal: Omit<SavedDeal, 'id' | 'savedAt'>): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO saved_deals (dealID, title, salePrice, normalPrice, savings, thumb, savedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [deal.dealID, deal.title, deal.salePrice, deal.normalPrice, deal.savings, deal.thumb, new Date().toISOString()]
  );
}

export async function removeSavedDeal(dealID: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM saved_deals WHERE dealID = ?', [dealID]);
}

export async function getAllSavedDeals(): Promise<SavedDeal[]> {
  const database = await getDatabase();
  return await database.getAllAsync<SavedDeal>('SELECT * FROM saved_deals ORDER BY savedAt DESC');
}

export async function isDealSaved(dealID: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM saved_deals WHERE dealID = ?',
    [dealID]
  );
  return (result?.count ?? 0) > 0;
}
