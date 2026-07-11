# TechNx Backend

Node.js + Express backend that powers the TechNx mobile app. It aggregates tech news from 30+ RSS feeds, generates AI summaries via Gemini, finds related YouTube videos, and stores everything in Firebase Firestore.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Then fill in your API keys in .env

# 3. Start (production)
npm start

# 4. Start (development with auto-reload)
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key |
| `GOOGLE_API_KEY` | Yes | Gemini API key for AI summaries |
| `GOOGLE_PROJECT_ID` | Yes | Firebase/GCP project ID |
| `GOOGLE_TRANSLATE_API_KEY` | No | Google Translate API key |
| `UNSPLASH_ACCESS_KEY` | No | Unsplash API key for article images |
| `FIREBASE_PRIVATE_KEY` | Yes* | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Yes* | Firebase service account email |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes* | Path to Firebase credentials JSON |

\* Either use env vars (`FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL`) **or** a credentials file (`GOOGLE_APPLICATION_CREDENTIALS`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/content?lang=en` | Get latest AI-summarized content card |
| `GET` | `/api/feeds?lang=en` | Get list of available feed articles |
| `GET` | `/api/languages` | Get supported languages |
| `GET` | `/api/health` | API route health check |

## Architecture

```
backend/
├── server.js                 # Express app entry point
├── config/
│   ├── constants.js          # App constants & supported languages
│   ├── firebase.js           # Firebase Admin SDK initialization
│   └── rssFeeds.js           # RSS feed URLs (30+ sources)
├── controllers/
│   └── contentController.js  # Request handlers
├── routes/
│   └── contentRoutes.js      # API route definitions
├── services/
│   ├── contentFilterService.js    # Tech content relevance filtering
│   ├── enhancedYoutubeService.js  # YouTube video search
│   ├── firestoreService.js        # Firestore read/write
│   ├── summarizeService.js        # Gemini AI summarization
│   └── unsplashService.js         # Unsplash image fetching
└── utils/
    ├── rssService.js         # RSS feed parsing & filtering
    └── schedule.js           # Feed update scheduler (1-min interval)
```

## How It Works

1. **Scheduler** rotates through RSS feeds every minute
2. **Content Filter** scores articles for tech relevance (keyword matching + confidence scoring)
3. **Gemini AI** generates structured summaries with "Why It Matters" and "What You Learn" sections
4. **YouTube Service** finds related tutorial/explainer videos
5. **Firestore** stores processed articles for the mobile app to consume
