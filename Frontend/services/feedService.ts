import { fetchFeedsFromFirestore } from '@/lib/firestore';

const API_BASE_URL = 'http://localhost:3000/api';

export interface FeedArticle {
  id: string;
  title: string;
  link: string;
  summary: {
    text: string;
    why: string;
    upskill: string;
  };
  lessonContent?: {
    title: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
  };
  youtube?: {
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    source?: string;
  } | null;
  image?: string;
  imageSource?: string;
  content: string;
  source: string;
  language?: string;
  lastUpdated: string;
  techFilter?: {
    confidence: number;
    score: number;
    keywords: {
      tech: string[];
      companies: string[];
    };
    reasons: string[];
  };
}

/**
 * Fetch articles from Firestore (primary method).
 * Falls back to the backend API if Firestore is unavailable.
 */
export async function fetchArticles(): Promise<FeedArticle[]> {
  try {
    const articles = await fetchFeedsFromFirestore();
    return articles as FeedArticle[];
  } catch (error) {
    console.warn('Firestore fetch failed, falling back to API:', error);
    return fetchArticlesFromAPI();
  }
}

/**
 * Fetch articles from the backend REST API.
 */
export async function fetchArticlesFromAPI(language = 'en'): Promise<FeedArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/feeds?lang=${language}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    return data.feeds || [];
  } catch (error) {
    console.error('API fetch failed:', error);
    return [];
  }
}

/**
 * Fetch a single content card from the backend.
 */
export async function fetchLatestContent(language = 'en'): Promise<FeedArticle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/content?lang=${language}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Content fetch failed:', error);
    return null;
  }
}

/**
 * Check if the backend API is reachable.
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Fetch supported languages from the backend.
 */
export async function fetchSupportedLanguages(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`);
    if (!response.ok) return ['en'];
    const data = await response.json();
    return data.supported || ['en'];
  } catch {
    return ['en'];
  }
}
