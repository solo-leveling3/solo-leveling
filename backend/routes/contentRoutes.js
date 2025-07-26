// backend/routes/contentRoutes.js

import express from "express";
import { generateCardContent, getAvailableFeeds } from "../controllers/contentController.js";
import { SUPPORTED_LANGUAGES } from '../config/constants.js';

const router = express.Router();

// Error handling middleware with timeout
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 10000);
        });
        
        const resultPromise = fn(req, res, next);
        await Promise.race([resultPromise, timeoutPromise]);
    } catch (error) {
        next(error);
    }
};

// Basic routes with async error handling
router.get("/content", asyncHandler(async (req, res) => {
    try {
        const language = req.query.lang || 'en';
        if (!SUPPORTED_LANGUAGES.includes(language)) {
            return res.status(400).json({ 
                error: 'Unsupported language',
                supported: SUPPORTED_LANGUAGES
            });
        }

        const content = await generateCardContent(language);
        res.json(content);
    } catch (error) {
        console.error('❌ Content fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch content',
            message: error.message
        });
    }
}));
router.get("/feeds", asyncHandler(getAvailableFeeds));

// Add language support info endpoint
router.get("/languages", (req, res) => {
    res.json({
        supported: SUPPORTED_LANGUAGES,
        default: 'en',
        current: req.query.lang || 'en'
    });
});

// Health check route
router.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Enhanced error handler middleware
router.use((err, req, res, next) => {
    console.error("❌ Route error:", {
        message: err.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        path: process.env.NODE_ENV === 'development' ? req.path : undefined
    });
});

export default router;