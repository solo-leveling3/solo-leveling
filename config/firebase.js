import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_NAME } from './constants.js';

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { APP_NAME } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

try {
    let serviceAccount;
    
    if (process.env.NODE_ENV === 'production') {
        // Production: Use environment variables or secret file (for deployment platforms)
        if (process.env.FIREBASE_PRIVATE_KEY) {
            // Option 1: Environment variables (recommended for most platforms)
            serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
            };
        } else {
            // Option 2: Secret file (for platforms like Render that support secret files)
            try {
                serviceAccount = JSON.parse(
                    readFileSync('/etc/secrets/firebase-credentials.json', 'utf8')
                );
            } catch (secretError) {
                console.error('❌ Failed to load Firebase credentials from secret file');
                throw new Error('Firebase credentials not found in production environment');
            }
        }
    } else {
        // Development: Use local file (make sure it exists and is gitignored)
        const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
        try {
            serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));
        } catch (fileError) {
            console.error('❌ Firebase credentials file not found locally');
            console.log('ℹ️ Please create config/firebase-credentials.json for local development');
            console.log('ℹ️ Download from Firebase Console > Project Settings > Service Accounts');
            throw new Error('Firebase credentials file missing for development');
        }
    }

    // Check if app is already initialized
    try {
        db = getFirestore(admin.app(APP_NAME));
        console.log('✅ Firebase app already initialized');
    } catch {
        // Initialize new app if not exists
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        }, APP_NAME);
        db = getFirestore(app);
        console.log('✅ Firebase initialized successfully');
    }
    
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('ℹ️ Make sure Firebase credentials are properly configured');
    
    // Set db to null so app can still run (but Firebase features won't work)
    db = null;
}

export { db };