import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

export async function storeFeed(feedData) {
    try {
        if (!db) {
            console.warn('⚠️ Firebase not initialized, skipping database storage');
            return null;
        }

        console.log('💾 Attempting to store article in database...');
        console.log('📄 Article title:', feedData.title);
        console.log('🔗 Article link:', feedData.link);
        
        // Store with lesson content
        const doc = await db.collection('feeds').add({
            ...feedData,
            language: 'en',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Successfully stored article in database!');
        console.log('🆔 Document ID:', doc.id);
        console.log('📊 Article data stored:', {
            title: feedData.title,
            feedTitle: feedData.feedTitle,
            hasImage: !!feedData.image,
            hasSummary: !!feedData.summary,
            hasLessonContent: !!feedData.lessonContent, // Add this check
            contentLength: feedData.content?.length || 0
        });

        return doc.id;
    } catch (error) {
        console.error('❌ Error storing feed:', error);
        console.error('📄 Failed article title:', feedData?.title || 'Unknown');
        throw error;
    }
}

export async function getFeedsByLanguage(language = 'en', limit = 10) {
    try {
        if (!db) {
            console.warn('⚠️ Firebase not initialized, returning empty array');
            return [];
        }

        console.log(`📖 Fetching ${limit} feeds in language: ${language}`);
        
        const snapshot = await db.collection('feeds')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const feeds = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ Retrieved ${feeds.length} feeds from database`);
        
        return feeds;
    } catch (error) {
        console.error('❌ Error fetching feeds:', error);
        throw error;
    }
}