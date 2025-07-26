import { createApi } from 'unsplash-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Unsplash API
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

/**
 * Get a related image from Unsplash based on article title/keywords
 * @param {string} title - Article title
 * @param {string} content - Article content (optional)
 * @returns {Promise<string|null>} Image URL or null
 */
export async function getRelatedImage(title, content = '') {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.log('⚠️ Unsplash API key not configured');
      return null;
    }

    console.log('🖼️ Searching Unsplash for related image...');

    // Extract keywords for better image search
    const keywords = extractImageKeywords(title, content);
    console.log('🔍 Image search keywords:', keywords);

    // Try different search strategies
    const searchStrategies = [
      keywords.slice(0, 2).join(' '), // Top 2 keywords
      keywords[0] || 'technology', // Most relevant keyword
      'technology abstract', // Fallback to tech images
      'digital innovation', // Alternative tech theme
    ];

    for (const searchTerm of searchStrategies) {
      const imageUrl = await searchUnsplashImage(searchTerm);
      if (imageUrl) {
        console.log(`✅ Found image for: "${searchTerm}"`);
        return imageUrl;
      }
    }

    console.log('❌ No suitable images found on Unsplash');
    return null;

  } catch (error) {
    console.error('❌ Unsplash API error:', error.message);
    return null;
  }
}

/**
 * Search for a specific image on Unsplash
 * @param {string} query - Search query
 * @returns {Promise<string|null>} Image URL or null
 */
async function searchUnsplashImage(query) {
  try {
    const result = await unsplash.search.getPhotos({
      query: query,
      page: 1,
      perPage: 10,
      orientation: 'landscape',
      contentFilter: 'high', // Only high-quality images
      orderBy: 'relevant'
    });

    if (result.errors) {
      console.error('❌ Unsplash search errors:', result.errors);
      return null;
    }

    const photos = result.response?.results;
    if (!photos || photos.length === 0) {
      console.log(`ℹ️ No images found for: "${query}"`);
      return null;
    }

    // Filter for tech/business appropriate images
    const appropriatePhotos = photos.filter(photo => {
      const description = (photo.description || '').toLowerCase();
      const altDescription = (photo.alt_description || '').toLowerCase();
      const tags = photo.tags?.map(tag => tag.title.toLowerCase()) || [];
      
      const allText = [description, altDescription, ...tags].join(' ');
      
      // Exclude inappropriate content
      const inappropriateTerms = [
        'people', 'person', 'man', 'woman', 'face', 'portrait', 'wedding',
        'party', 'celebration', 'food', 'animal', 'nature landscape'
      ];
      
      const hasInappropriate = inappropriateTerms.some(term => 
        allText.includes(term)
      );
      
      return !hasInappropriate;
    });

    // Use filtered photos or fall back to all photos
    const photosToUse = appropriatePhotos.length > 0 ? appropriatePhotos : photos;
    
    // Get a random photo from the results
    const randomPhoto = photosToUse[Math.floor(Math.random() * photosToUse.length)];
    
    // Return high-quality image URL
    const imageUrl = randomPhoto.urls.regular || randomPhoto.urls.small;
    
    // Track download for Unsplash API compliance
    if (randomPhoto.links?.download_location) {
      try {
        await unsplash.photos.trackDownload({
          downloadLocation: randomPhoto.links.download_location,
        });
      } catch (trackError) {
        console.warn('⚠️ Failed to track download:', trackError.message);
      }
    }
    
    console.log(`📸 Selected image: ${randomPhoto.alt_description || 'No description'}`);
    return imageUrl;

  } catch (error) {
    console.error(`❌ Error searching Unsplash for "${query}":`, error.message);
    return null;
  }
}

/**
 * Extract relevant keywords from article title and content for image search
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Array<string>} Array of keywords
 */
function extractImageKeywords(title, content = '') {
  const fullText = `${title} ${content}`.toLowerCase();
  
  // Tech-related keywords that work well for images
  const techKeywords = [
    'technology', 'digital', 'innovation', 'startup', 'software', 'app',
    'ai', 'artificial intelligence', 'machine learning', 'robotics',
    'blockchain', 'cryptocurrency', 'cloud', 'computing', 'data',
    'cybersecurity', 'mobile', 'internet', 'web', 'coding', 'programming',
    'automation', 'virtual reality', 'augmented reality', 'iot',
    'fintech', 'quantum', 'neural network', 'algorithm'
  ];
  
  // Company/product keywords
  const brandKeywords = [
    'apple', 'google', 'microsoft', 'amazon', 'meta', 'tesla',
    'netflix', 'uber', 'spotify', 'twitter', 'instagram',
    'iphone', 'android', 'windows', 'chrome', 'aws'
  ];
  
  // Find matching keywords
  const foundTechKeywords = techKeywords.filter(keyword => 
    fullText.includes(keyword)
  );
  
  const foundBrandKeywords = brandKeywords.filter(keyword => 
    fullText.includes(keyword)
  );
  
  // Extract important words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'this', 'that', 'will', 'from'].includes(word)
    );
  
  // Combine and prioritize keywords
  const keywords = [
    ...foundTechKeywords,
    ...foundBrandKeywords,
    ...titleWords.slice(0, 3) // Top 3 words from title
  ];
  
  // Remove duplicates and return
  return [...new Set(keywords)].slice(0, 5);
}

/**
 * Get a fallback tech image when no specific image is found
 * @returns {Promise<string|null>} Fallback image URL
 */
export async function getFallbackTechImage() {
  const fallbackQueries = [
    'technology abstract blue',
    'digital network',
    'computer code screen',
    'tech innovation',
    'modern technology'
  ];
  
  const randomQuery = fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];
  return await searchUnsplashImage(randomQuery);
}