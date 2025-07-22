import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('news.db');

export const initDatabase = async () => {
  try {
    // Create articles table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY NOT NULL,
        url TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        imageUrl TEXT,
        fetchedAt INTEGER NOT NULL
      );
    `);

    // Create translations table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY NOT NULL,
        article_id INTEGER NOT NULL,
        language TEXT NOT NULL,
        translated_title TEXT NOT NULL,
        translated_summary TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES articles (id),
        UNIQUE(article_id, language)
      );
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const insertArticle = async (article: { url: string; title: string; summary: string; imageUrl?: string; }) => {
  try {
    const result = await db.runAsync(
      'INSERT OR IGNORE INTO articles (url, title, summary, imageUrl, fetchedAt) VALUES (?, ?, ?, ?, ?)',
      [article.url, article.title, article.summary, article.imageUrl || null, Date.now()]
    );

    if (result.lastInsertRowId) {
      return result.lastInsertRowId;
    } else {
      // If insert was ignored, get the existing article id
      const selectResult = await db.getFirstAsync<{ id: number }>('SELECT id FROM articles WHERE url = ?', [article.url]);
      if (selectResult) {
        return selectResult.id;
      } else {
        throw new Error('Failed to insert or find article.');
      }
    }
  } catch (error) {
    console.error('Error inserting article:', error);
    throw error;
  }
};

export const insertTranslation = async (translation: { article_id: number; language: string; translated_title: string; translated_summary: string; }) => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO translations (article_id, language, translated_title, translated_summary) VALUES (?, ?, ?, ?)',
      [translation.article_id, translation.language, translation.translated_title, translation.translated_summary]
    );
  } catch (error) {
    console.error('Error inserting translation:', error);
    throw error;
  }
};

export const getTranslatedArticle = async (url: string, language: string) => {
  try {
    const result = await db.getFirstAsync<{ imageUrl: string; translated_title: string; translated_summary: string; }>(`
      SELECT 
        a.imageUrl,
        t.translated_title,
        t.translated_summary
       FROM articles a
       JOIN translations t ON a.id = t.article_id
       WHERE a.url = ? AND t.language = ?
    `, [url, language]);

    if (result) {
      return {
        title: result.translated_title,
        summary: result.translated_summary,
        imageUrl: result.imageUrl
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting translated article:', error);
    throw error;
  }
};

export const getCachedArticles = async (language: string) => {
  try {
    const results = await db.getAllAsync<{ url: string; imageUrl: string; title: string; summary: string; }>(`
      SELECT 
        a.url,
        a.imageUrl,
        CASE 
          WHEN t.translated_title IS NOT NULL THEN t.translated_title
          ELSE a.title
        END as title,
        CASE 
          WHEN t.translated_summary IS NOT NULL THEN t.translated_summary
          ELSE a.summary
        END as summary
       FROM articles a
       LEFT JOIN translations t ON a.id = t.article_id AND t.language = ?
       ORDER BY a.fetchedAt DESC
       LIMIT 10
    `, [language]);

    return results.map(item => ({
      url: item.url,
      title: item.title,
      summary: item.summary,
      imageUrl: item.imageUrl
    }));
  } catch (error) {
    console.error('Error getting cached articles:', error);
    throw error;
  }
};
