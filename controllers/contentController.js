// contentController.js
import { getFeedItem } from "../utils/rssService.js";
import { summarizeArticle } from "../services/summarizeService.js";
import { getRelatedYouTubeVideo } from "../services/enhancedYoutubeService.js";
import { getCurrentFeed } from '../utils/schedule.js';
import { getFeedsByLanguage } from '../services/firestoreService.js';
import { RSS_FEEDS } from '../config/rssFeeds.js';

// Add this import if not already present
import { generateLessonContent } from "../services/summarizeService.js";

// Cache to store the latest feed
const feedCache = {
    currentIndex: 0,
    lastUpdate: 0,
    currentFeed: null
};

// Update interval in milliseconds (1 minute)
const UPDATE_INTERVAL = 60 * 1000;

// Function to rotate through feeds
function getNextFeed() {
    const feedNames = Object.keys(RSS_FEEDS);
    feedCache.currentIndex = (feedCache.currentIndex + 1) % feedNames.length;
    return feedNames[feedCache.currentIndex];
}

// Function to check and update cache
async function updateFeedCache() {
    const now = Date.now();
    if (now - feedCache.lastUpdate > UPDATE_INTERVAL) {
        const feedName = getNextFeed();
        const feedUrl = RSS_FEEDS[feedName];
        
        try {
            const rssItem = await getFeedItem(feedUrl);
            if (rssItem) {
                const summary = await summarizeArticle({
                    title: rssItem.title,
                    description: rssItem.contentSnippet || rssItem.content || "",
                    link: rssItem.link,
                });

                const youtube = await getRelatedYouTubeVideo(rssItem.title, rssItem.content);

                feedCache.currentFeed = {
                    title: rssItem.title,
                    link: rssItem.link,
                    summary,
                    youtube,
                    content: rssItem.content || rssItem.contentSnippet || "",
                    source: feedName,
                    lastUpdated: new Date().toISOString()
                };
                feedCache.lastUpdate = now;
            }
        } catch (error) {
            console.error(`❌ Failed to update feed cache: ${error.message}`);
        }
    }
    return feedCache.currentFeed;
}

export const generateCardContent = async (language = 'en') => {
    try {
        // Get the latest feed from Firestore
        const feeds = await getFeedsByLanguage(language, 1);
        
        if (!feeds || feeds.length === 0) {
            throw new Error('No content available');
        }

        const latestFeed = feeds[0];

        return {
            title: latestFeed.title,
            link: latestFeed.link,
            summary: latestFeed.summary,
            youtube: latestFeed.youtube || null,
            content: latestFeed.content,
            source: latestFeed.source,
            language: latestFeed.language,
            lastUpdated: latestFeed.timestamp?.toDate().toISOString() || new Date().toISOString(),
            id: latestFeed.id
        };
    } catch (error) {
        console.error('❌ Error generating content:', error);
        throw error;
    }
};

export const getAvailableFeeds = async (req, res) => {
    try {
        const feeds = await getFeedsByLanguage(req.query.lang || 'en', 10);
        return res.json({
            feeds: feeds.map(feed => ({
                id: feed.id,
                title: feed.title,
                source: feed.source,
                language: feed.language,
                lastUpdated: feed.timestamp?.toDate().toISOString()
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching feeds:', error);
        throw error;
    }
};

// In your content generation function, make sure to include lesson content
export async function getContent(req, res) {
    try {
        // Get feeds from database (will now include lessonContent)
        const feeds = await getFeedsByLanguage('en', 10);
        
        res.json({
            success: true,
            data: feeds,
            message: 'Content retrieved successfully'
        });
    } catch (error) {
        console.error('❌ Error getting content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve content'
        });
    }
}
