import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_NAME } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

function initializeFirebase() {
    try {
        console.log('🔧 Starting Firebase initialization...');
        const envVars = {
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            projectId: process.env.GOOGLE_PROJECT_ID,
            credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
        };
        
        console.log('🔍 Checking environment variables:');
        Object.entries(envVars).forEach(([k, v]) => {
            console.log(`   - ${k}:`, v ? 'Present' : 'Missing');
        });

        // Check if app is already initialized
        try {
            db = getFirestore(admin.app(APP_NAME));
            console.log('✅ Firebase app already initialized');
            return;
        } catch {
            // Continue with initialization
        }

        let credential = null;
        
        // Try env variables first (most secure)
        if (envVars.privateKey && envVars.clientEmail && envVars.projectId) {
            console.log('🔑 Using environment variables for Firebase credentials');
            try {
                credential = admin.credential.cert({
                    projectId: envVars.projectId,
                    clientEmail: envVars.clientEmail,
                    privateKey: envVars.privateKey.replace(/\\n/g, '\n')
                });
                console.log('✅ Environment variable credentials created successfully');
            } catch (envError) {
                console.error('❌ Error creating credentials from environment variables:', envError.message);
            }
        } 
        
        // Try credentials file as fallback
        if (!credential && envVars.credentialsFile) {
            console.log('📁 Attempting to use credentials file:', envVars.credentialsFile);
            try {
                credential = admin.credential.cert(envVars.credentialsFile);
                console.log('✅ Successfully loaded credentials file');
            } catch (fileError) {
                console.error('❌ Credentials file not found or invalid:', fileError.message);
            }
        }

        if (!credential) {
            console.error('❌ No valid Firebase credentials found. Firebase features will be disabled.');
            console.error('');
            console.error('🔧 To fix this issue:');
            console.error('   Option 1 (Recommended): Use environment variables');
            console.error('   - Add these to your .env file:');
            console.error('     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_KEY\\n-----END PRIVATE KEY-----\\n"');
            console.error('     FIREBASE_CLIENT_EMAIL="your-service-account@tech2news-2120f.iam.gserviceaccount.com"');
            console.error('     GOOGLE_PROJECT_ID="tech2news-2120f"');
            console.error('');
            console.error('   Option 2: Use credentials file');
            console.error('   - Download service account JSON from Firebase Console');
            console.error('   - Save it as: config/firebase-credentials.json');
            console.error('');
            db = null;
            return;
        }

        const app = admin.initializeApp({
            credential: credential
        }, APP_NAME);
        db = getFirestore(app);
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.error('Full error:', error);
        db = null;
    }
}

// Initialize Firebase
initializeFirebase();

export { db };