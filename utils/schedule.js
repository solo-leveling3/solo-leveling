import { getFeedItem } from "./rssService.js";
import { summarizeArticle, generateLessonContent } from "../services/summarizeService.js";
import { getRelatedYouTubeVideo } from "../services/enhancedYoutubeService.js"; // Changed import
import { storeFeed } from '../services/firestoreService.js';
import { RSS_FEEDS } from '../config/rssFeeds.js';

// Cache to store the latest feed data
export const feedCache = {
    currentIndex: 0,
    lastUpdate: 0,
    currentFeed: null,
    isUpdating: false
};

function getNextFeed() {
    const feedNames = Object.keys(RSS_FEEDS);
    feedCache.currentIndex = (feedCache.currentIndex + 1) % feedNames.length;
    return {
        name: feedNames[feedCache.currentIndex],
        url: RSS_FEEDS[feedNames[feedCache.currentIndex]]
    };
}

const UPDATE_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds

async function updateFeed() {
    if (feedCache.isUpdating) return;
    
    try {
        feedCache.isUpdating = true;
        const { name, url } = getNextFeed();
        console.log(`🔄 Fetching from ${name} at ${new Date().toISOString()}`);

        const rssItem = await getFeedItem(url);
        if (!rssItem) {
            throw new Error(`No items found in feed: ${name}`);
        }

        console.log('📝 Generating content for article...');

        // Generate summary, lesson content, and enhanced YouTube video
        const [summary, lessonContent, youtube] = await Promise.all([
            summarizeArticle({
                title: rssItem.title,
                description: rssItem.contentSnippet || rssItem.content || "",
                link: rssItem.link,
            }),
            generateLessonContent({
                title: rssItem.title,
                description: rssItem.contentSnippet || rssItem.content || "",
            }),
            getRelatedYouTubeVideo(rssItem.title, rssItem.contentSnippet || rssItem.content || "") // Enhanced service
        ]);

        const feedData = {
            title: rssItem.title,
            link: rssItem.link,
            summary,
            lessonContent,
            youtube,
            image: rssItem.image,
            imageSource: rssItem.imageSource,
            content: rssItem.content || rssItem.contentSnippet || "",
            source: name,
            lastUpdated: new Date().toISOString()
        };

        // Store in cache
        feedCache.currentFeed = feedData;
        feedCache.lastUpdate = Date.now();

        // Store in Firestore
        await storeFeed(feedData);

        console.log(`✅ Updated feed from ${name} with enhanced YouTube video`);
        if (youtube?.source) {
            console.log(`🎥 YouTube source: ${youtube.source} - ${youtube.title}`);
        }

    } catch (error) {
        console.error(`❌ Feed update failed:`, error);
    } finally {
        feedCache.isUpdating = false;
    }
}

// Initialize the scheduler
export function initializeScheduler() {
    // Initial update
    updateFeed();

    // Schedule updates every 1 minute
    setInterval(updateFeed, UPDATE_INTERVAL);

    console.log(`📅 Feed scheduler initialized (updating every ${UPDATE_INTERVAL/1000/60} minutes)`);
}

// Get current feed data
export function getCurrentFeed() {
    return feedCache.currentFeed;
}