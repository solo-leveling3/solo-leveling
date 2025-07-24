import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_NAME } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccount = path.join(__dirname, 'firebase-credentials.json');

let db;

try {
    // Check if app is already initialized
    try {
        db = getFirestore(admin.app(APP_NAME));
    } catch {
        // Initialize new app if not exists
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        }, APP_NAME);
        db = getFirestore(app);
    }
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
}

export { db };