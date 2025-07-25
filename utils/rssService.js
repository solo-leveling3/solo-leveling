import Parser from "rss-parser";
import { summarizeArticle } from "../services/summarizeService.js";
import { db } from "../config/firebase.js";
import { getRelatedImage, getFallbackTechImage } from "../services/unsplashService.js";
import { ContentFilterService } from "../services/contentFilterService.js";
import admin from 'firebase-admin';

// Cache to store previously fetched feed items
const feedCache = {
  items: new Map(),
  maxSize: 100,
  expirationTime: 1000 * 60 * 60 * 2 // Reduced to 2 hours for more fresh content
};

// Configure parser to handle media content
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      'image',
      'enclosure'
    ]
  },
  timeout: 5000,
  headers: {
    'User-Agent': 'Tech2News RSS Reader/1.0'
  }
});

export async function getFeedItem(rssUrl, saveToDb = true, returnMultiple = false) {
  try {
    console.log(`📰 Fetching RSS feed from: ${rssUrl}`);
    const feed = await parser.parseURL(rssUrl);
    
    if (!feed?.items?.length) {
      console.warn('⚠️ No items found in feed');
      return returnMultiple ? [] : null;
    }

    // Get more items to filter through (top 20 for better selection)
    const recentItems = feed.items.slice(0, 20);
    console.log(`📊 Found ${recentItems.length} recent items in feed`);

    // Apply content filtering to all recent items
    const filteredItems = [];
    
    for (const item of recentItems) {
      // Check if item was processed recently
      const isProcessedRecently = await isItemRecentlyProcessed(item);
      
      if (isProcessedRecently) {
        console.log(`⏩ Skipping recently processed: "${item.title}"`);
        continue;
      }

      // Apply content filter
      const articleData = {
        title: item.title ?? "",
        contentSnippet: item.contentSnippet ?? item.content ?? "",
        content: item.content ?? "",
        feedTitle: feed.title ?? "Unknown Source",
        link: item.link ?? ""
      };

      const filterResult = ContentFilterService.filterTechContent(articleData);
      
      console.log(`🔍 Content filter for "${item.title}":`, {
        confidence: filterResult.confidence,
        isTechRelated: filterResult.isTechRelated,
        score: filterResult.score
      });

      // Only include items that pass the tech filter (60% confidence minimum)
      if (filterResult.isTechRelated && filterResult.confidence >= 60) {
        // Try to extract image from RSS first
        let imageUrl = extractImageUrl(item);
        
        // If no image found in RSS, get one from Unsplash
        if (!imageUrl) {
          console.log('🔍 No image in RSS feed, searching Unsplash...');
          imageUrl = await getRelatedImage(
            item.title, 
            item.contentSnippet || item.content
          );
          
          // If still no image, get a fallback tech image
          if (!imageUrl) {
            console.log('🔄 Getting fallback tech image...');
            imageUrl = await getFallbackTechImage();
          }
        }

        const processedArticle = {
          title: item.title ?? "",
          contentSnippet: item.contentSnippet ?? item.content ?? "",
          link: item.link ?? "",
          content: item.content ?? "",
          pubDate: item.pubDate ?? new Date().toISOString(),
          image: imageUrl,
          imageSource: imageUrl ? (extractImageUrl(item) ? 'rss' : 'unsplash') : null,
          feedTitle: feed.title ?? "Unknown Source",
          sourceUrl: rssUrl,
          techFilter: filterResult // Include filter results for debugging
        };

        // Add to cache with current timestamp
        addToCache(item);

        filteredItems.push(processedArticle);
        
        console.log(`✅ High-confidence tech article: "${item.title}" (${filterResult.confidence}% confidence)`);
        if (imageUrl) {
          console.log(`🖼️ Image found (${processedArticle.imageSource}): ${imageUrl}`);
        }

        // If we only need one item and found a good one, break
        if (!returnMultiple) {
          break;
        }
      } else {
        console.log(`❌ Article filtered out: "${item.title}" (${filterResult.confidence}% confidence, reasons: ${filterResult.reasons.join(', ')})`);
      }
    }

    // Return results based on returnMultiple flag
    if (returnMultiple) {
      // Sort by confidence (highest first) and return all qualifying items
      const sortedItems = filteredItems.sort((a, b) => b.techFilter.confidence - a.techFilter.confidence);
      console.log(`📊 Returning ${sortedItems.length} high-confidence tech articles`);
      return sortedItems;
    } else {
      // Return the single best item or null if none qualify
      if (filteredItems.length > 0) {
        const bestItem = filteredItems.sort((a, b) => b.techFilter.confidence - a.techFilter.confidence)[0];
        console.log(`✅ Successfully processed best tech article: "${bestItem.title}" (${bestItem.techFilter.confidence}% confidence)`);
        return bestItem;
      } else {
        console.warn('⚠️ No tech articles found that meet the 60% confidence threshold');
        return null;
      }
    }

  } catch (error) {
    console.error('❌ RSS Feed error:', {
      message: error.message,
      code: error.code,
      url: rssUrl
    });
    return returnMultiple ? [] : null;
  }
}

// Missing function - Check if item was processed recently
async function isItemRecentlyProcessed(item) {
  const key = generateCacheKey(item);
  const cachedItem = feedCache.items.get(key);
  
  if (cachedItem) {
    const timeSinceProcessed = Date.now() - cachedItem.timestamp;
    const oneHour = 1000 * 60 * 60; // 1 hour
    
    if (timeSinceProcessed < oneHour) {
      return true; // Too recent
    } else {
      // Remove from cache if older than 1 hour
      feedCache.items.delete(key);
      return false;
    }
  }
  
  // Also check database for recently processed items
  try {
    if (db) {
      const feedsRef = db.collection('feeds');
      const recentQuery = feedsRef
        .where('link', '==', item.link)
        .where('timestamp', '>', new Date(Date.now() - oneHour))
        .limit(1);
      
      const snapshot = await recentQuery.get();
      
      if (!snapshot.empty) {
        console.log(`📄 Item recently processed in database: "${item.title}"`);
        return true;
      }
    }
  } catch (dbError) {
    console.warn('⚠️ Database check failed, continuing with cache only:', dbError.message);
  }
  
  return false; // Not in cache or database, safe to process
}

// Function to check if article already exists in Firebase using Admin SDK
async function isArticleInDatabase(item) {
  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return false;
    }

    // Use Admin SDK query methods
    const feedsRef = db.collection('feeds');
    const linkQuery = feedsRef.where('link', '==', item.link).limit(1);
    const linkSnapshot = await linkQuery.get();
    
    if (!linkSnapshot.empty) {
      console.log(`📄 Article link exists in database: "${item.title}"`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking article in database:', error);
    return false; // Allow saving if check fails
  }
}

// Function to save article to Firebase using Admin SDK
async function saveArticleToDatabase(articleData) {
  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return null;
    }

    // Check if article already exists
    const exists = await isArticleInDatabase(articleData);
    
    if (exists) {
      console.log(`📄 Skipping save - article URL already exists: "${articleData.title}"`);
      return null;
    }
    
    // Use Admin SDK to add document
    const feedsRef = db.collection('feeds');
    const docRef = await feedsRef.add({
      ...articleData,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processed: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Article saved to database: "${articleData.title}"`);
    console.log(`🆔 Document ID: ${docRef.id}`);
    
    return docRef;
  } catch (error) {
    console.error('❌ Error saving article to database:', error);
    return null;
  }
}

function isItemCached(item) {
  const key = generateCacheKey(item);
  const cachedItem = feedCache.items.get(key);
  
  if (!cachedItem) return false;
  
  // Check if cache has expired
  if (Date.now() - cachedItem.timestamp > feedCache.expirationTime) {
    feedCache.items.delete(key);
    return false;
  }
  
  return true;
}

function addToCache(item) {
  // Remove oldest items if cache is full
  if (feedCache.items.size >= feedCache.maxSize) {
    const oldestKey = feedCache.items.keys().next().value;
    feedCache.items.delete(oldestKey);
  }
  
  const key = generateCacheKey(item);
  feedCache.items.set(key, {
    timestamp: Date.now(),
    title: item.title,
    link: item.link
  });
  
  console.log(`📝 Added to cache: "${item.title}"`);
}

function generateCacheKey(item) {
  const title = (item.title || '').trim();
  const link = (item.link || '').trim();
  
  // Use simpler key generation
  const keyBase = [title, link].filter(Boolean).join('|');
  
  return keyBase.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-\.\/\:]/g, '')
    .substring(0, 200);
}

function extractImageUrl(item) {
  // Try different possible image locations in RSS feed
  if (item.media?.$ && item.media.$.url) {
    return item.media.$.url;
  }

  if (item.media?.content?.[0]?.$ && item.media.content[0].$.url) {
    return item.media.content[0].$.url;
  }

  if (item.thumbnail?.$ && item.thumbnail.$.url) {
    return item.thumbnail.$.url;
  }

  if (item.enclosure?.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  if (item['media:content']?.[0]?.$ && item['media:content'][0].$.url) {
    return item['media:content'][0].$.url;
  }

  // Try to find image in content if it exists
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  return null;
}

// Export additional functions for database management using Admin SDK
export async function getAllHighConfidenceArticles(rssUrls, minConfidence = 60) {
  const allArticles = [];
  
  console.log(`🔍 Fetching high-confidence tech articles from ${rssUrls.length} RSS feeds...`);
  
  for (const rssUrl of rssUrls) {
    try {
      console.log(`\n📰 Processing feed: ${rssUrl}`);
      const articles = await getFeedItem(rssUrl, false, true); // returnMultiple = true, saveToDb = false
      
      if (articles && articles.length > 0) {
        // Filter articles that meet minimum confidence
        const highConfidenceArticles = articles.filter(article => 
          article.techFilter && article.techFilter.confidence >= minConfidence
        );
        
        allArticles.push(...highConfidenceArticles);
        console.log(`✅ Added ${highConfidenceArticles.length} high-confidence articles from this feed`);
      } else {
        console.log(`⚠️ No qualifying articles found in this feed`);
      }
    } catch (error) {
      console.error(`❌ Error processing feed ${rssUrl}:`, error.message);
      continue; // Continue with next feed
    }
  }
  
  // Sort all articles by confidence (highest first)
  const sortedArticles = allArticles.sort((a, b) => b.techFilter.confidence - a.techFilter.confidence);
  
  console.log(`\n📊 Total high-confidence tech articles found: ${sortedArticles.length}`);
  console.log(`🎯 Average confidence: ${Math.round(sortedArticles.reduce((sum, article) => sum + article.techFilter.confidence, 0) / sortedArticles.length)}%`);
  
  return sortedArticles;
}

export async function getAllArticles() {
  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return [];
    }

    const feedsRef = db.collection('feeds');
    const snapshot = await feedsRef.get();
    
    const articles = [];
    snapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });
    
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return [];
  }
}

export async function getArticlesBySource(sourceUrl) {
  try {
    if (!db) {
      console.error('❌ Database not initialized');
      return [];
    }

    const feedsRef = db.collection('feeds');
    const q = feedsRef.where('sourceUrl', '==', sourceUrl);
    const snapshot = await q.get();
    
    const articles = [];
    snapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });
    
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles by source:', error);
    return [];
  }
}
