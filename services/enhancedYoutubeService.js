import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enhanced YouTube video search with multiple strategies
 * Similar to how Unsplash service works with fallbacks
 */
export async function getRelatedYouTubeVideo(articleTitle, articleContent = '') {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY) {
      console.log('⚠️ YouTube API key not configured');
      return createSearchFallback(articleTitle);
    }

    console.log('🎥 Searching YouTube for related video...');

    // Extract keywords similar to Unsplash approach
    const keywords = extractVideoKeywords(articleTitle, articleContent);
    console.log('🔍 Video search keywords:', keywords);

    // Try different search strategies (like Unsplash)
    const searchStrategies = [
      `${keywords.slice(0, 2).join(' ')} explained`, // Top 2 keywords + explained
      `${keywords[0] || 'technology'} tutorial`, // Most relevant + tutorial
      `${articleTitle.split(' ').slice(0, 4).join(' ')}`, // First 4 words of title
      `${keywords[0] || 'technology'} news analysis`, // Fallback
      'tech news today' // Ultimate fallback
    ];

    for (const searchTerm of searchStrategies) {
      const video = await searchYouTubeWithFilters(API_KEY, searchTerm);
      if (video) {
        console.log(`✅ Found video for: "${searchTerm}"`);
        return video;
      }
    }

    console.log('❌ No suitable videos found, returning search fallback');
    return createSearchFallback(articleTitle);

  } catch (error) {
    console.error('❌ Enhanced YouTube API error:', error.message);
    return createSearchFallback(articleTitle);
  }
}

async function searchYouTubeWithFilters(apiKey, query) {
  try {
    console.log(`🔍 YouTube API search: "${query}"`);

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        key: apiKey,
        maxResults: 15, // Get more results for better filtering
        type: 'video',
        relevanceLanguage: 'en',
        order: 'relevance',
        videoEmbeddable: true,
        videoDuration: 'medium', // 4-20 minutes
        videoDefinition: 'high',
        publishedAfter: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // Last 6 months
        safeSearch: 'strict'
      },
      timeout: 10000
    });

    if (!response.data.items?.length) {
      console.log('ℹ️ No YouTube videos found for:', query);
      return null;
    }

    // Filter for high-quality tech content (similar to Unsplash filtering)
    const qualityVideos = response.data.items.filter(video => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      const channelTitle = video.snippet.channelTitle.toLowerCase();
      
      // Must have tech-related content
      const techTerms = [
        'tech', 'technology', 'software', 'app', 'digital', 'innovation',
        'explained', 'tutorial', 'review', 'analysis', 'news', 'update',
        'ai', 'machine learning', 'programming', 'coding', 'developer',
        'startup', 'blockchain', 'crypto', 'cloud', 'cybersecurity'
      ];
      
      const hasTechContent = techTerms.some(term => 
        title.includes(term) || description.includes(term) || channelTitle.includes(term)
      );
      
      // Exclude low-quality content
      const excludeTerms = [
        'compilation', 'reaction', 'unboxing', 'vlog', 'prank', 'challenge',
        'funny', 'meme', 'gaming', 'music', 'song', 'dance', 'comedy',
        'status', 'shorts', 'tiktok', 'instagram'
      ];
      
      const hasExcluded = excludeTerms.some(term => 
        title.includes(term) || description.includes(term)
      );
      
      return hasTechContent && !hasExcluded;
    });

    if (qualityVideos.length === 0) {
      console.log('❌ No tech-relevant videos found for:', query);
      return null;
    }

    // Select best video (prioritize by relevance and channel authority)
    const selectedVideo = qualityVideos[0];
    
    const result = {
      id: selectedVideo.id.videoId,
      title: selectedVideo.snippet.title,
      description: selectedVideo.snippet.description,
      thumbnail: selectedVideo.snippet.thumbnails.medium?.url || selectedVideo.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`,
      publishedAt: selectedVideo.snippet.publishedAt,
      channelTitle: selectedVideo.snippet.channelTitle,
      relevance: 'high',
      source: 'youtube_api'
    };

    console.log('✅ Found relevant video:', result.title);
    console.log('📺 Channel:', result.channelTitle);
    return result;

  } catch (error) {
    console.error(`❌ Error searching YouTube for "${query}":`, error.message);
    return null;
  }
}

function extractVideoKeywords(title, content = '') {
  const fullText = `${title} ${content}`.toLowerCase();
  
  // Similar to Unsplash keyword extraction but for video content
  const techKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'technology',
    'software', 'app', 'digital', 'innovation', 'startup', 'coding',
    'programming', 'blockchain', 'cryptocurrency', 'cloud', 'cybersecurity',
    'automation', 'robotics', 'iot', 'virtual reality', 'augmented reality'
  ];
  
  const brandKeywords = [
    'apple', 'google', 'microsoft', 'amazon', 'meta', 'tesla',
    'openai', 'chatgpt', 'github', 'nvidia', 'intel', 'spacex'
  ];
  
  const foundTech = techKeywords.filter(keyword => fullText.includes(keyword));
  const foundBrands = brandKeywords.filter(keyword => fullText.includes(keyword));
  
  // Extract important words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'this', 'that', 'will', 'from', 'they', 'have'].includes(word)
    )
    .slice(0, 3);
  
  // Combine and prioritize keywords
  const keywords = [
    ...foundTech,
    ...foundBrands,
    ...titleWords
  ];
  
  // Remove duplicates and return top 5
  return [...new Set(keywords)].slice(0, 5);
}

function createSearchFallback(searchQuery) {
  const cleanQuery = searchQuery.trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const encodedQuery = encodeURIComponent(cleanQuery);
  
  return {
    id: null,
    title: `Search YouTube for: ${cleanQuery}`,
    description: `No specific video found. Click to search YouTube for "${cleanQuery}"`,
    thumbnail: null,
    url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
    publishedAt: new Date().toISOString(),
    channelTitle: 'YouTube Search',
    relevance: 'search',
    source: 'search_fallback',
    isSearchFallback: true
  };
}