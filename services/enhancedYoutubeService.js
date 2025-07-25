import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Advanced noun extraction patterns
const NOUN_PATTERNS = {
  // Technology company names
  companies: [
    'apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'tesla', 'nvidia', 'intel', 'amd',
    'openai', 'anthropic', 'deepmind', 'salesforce', 'oracle', 'ibm', 'adobe', 'spotify', 'netflix',
    'uber', 'airbnb', 'twitter', 'x', 'linkedin', 'tiktok', 'instagram', 'snapchat', 'discord',
    'slack', 'zoom', 'dropbox', 'github', 'gitlab', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'
  ],
  
  // Technology terms and concepts
  technologies: [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network',
    'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3', 'metaverse',
    'cloud computing', 'saas', 'paas', 'iaas', 'api', 'microservices', 'devops', 'ci/cd',
    'cybersecurity', 'encryption', 'firewall', 'vpn', 'malware', 'phishing', 'ransomware',
    'internet of things', 'iot', 'edge computing', 'quantum computing', 'robotics', 'automation',
    '5g', '6g', 'wifi', 'bluetooth', 'ar', 'vr', 'augmented reality', 'virtual reality',
    'big data', 'analytics', 'data science', 'business intelligence', 'dashboard'
  ],
  
  // Tech products and devices
  products: [
    'iphone', 'ipad', 'macbook', 'airpods', 'android', 'pixel', 'galaxy', 'surface', 'xbox',
    'playstation', 'nintendo', 'switch', 'laptop', 'smartphone', 'tablet', 'smartwatch',
    'drone', 'robot', 'app', 'software', 'platform', 'framework', 'library', 'database',
    'browser', 'operating system', 'windows', 'macos', 'linux', 'ios', 'chrome', 'safari'
  ],
  
  // Programming and development
  programming: [
    'javascript', 'python', 'java', 'react', 'nodejs', 'typescript', 'go', 'rust', 'swift',
    'kotlin', 'flutter', 'react native', 'vue', 'angular', 'django', 'flask', 'spring',
    'docker', 'kubernetes', 'git', 'github', 'coding', 'programming', 'development',
    'frontend', 'backend', 'fullstack', 'algorithm', 'data structure'
  ]
};

// Common non-tech words to filter out
const STOP_WORDS = [
  'the', 'and', 'for', 'with', 'this', 'that', 'will', 'from', 'they', 'have', 'been',
  'their', 'said', 'each', 'which', 'what', 'where', 'when', 'why', 'how', 'could',
  'would', 'should', 'might', 'must', 'can', 'may', 'just', 'like', 'get', 'got',
  'make', 'made', 'take', 'come', 'went', 'see', 'know', 'think', 'want', 'need',
  'new', 'old', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'many',
  'most', 'more', 'some', 'very', 'still', 'way', 'even', 'back', 'good', 'much'
];

// Quota tracking
const quotaTracker = {
  dailyUsed: 0,
  dailyLimit: 8000,
  lastReset: new Date().toDateString(),
  
  canMakeRequest(units = 100) {
    const today = new Date().toDateString();
    if (this.lastReset !== today) {
      this.dailyUsed = 0;
      this.lastReset = today;
    }
    return (this.dailyUsed + units) <= this.dailyLimit;
  },
  
  trackUsage(units = 100) {
    this.dailyUsed += units;
  }
};

/**
 * Enhanced YouTube service with noun and technology extraction
 */
export async function getRelatedYouTubeVideo(articleTitle, articleContent = '') {
  try {
    console.log('🎯 Analyzing article for tech nouns and concepts...');
    
    // Extract meaningful terms from title and content
    const extractedTerms = extractTechNounsAndConcepts(articleTitle, articleContent);
    console.log('📊 Extracted terms:', extractedTerms);

    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY || !quotaTracker.canMakeRequest(200)) {
      console.log('⚠️ YouTube API unavailable, using enhanced search fallback');
      return createTechSearchFallback(extractedTerms, articleTitle);
    }

    // Generate multiple search queries based on extracted terms
    const searchQueries = generateTechSearchQueries(extractedTerms);
    console.log('🔍 Generated search queries:', searchQueries);

    // Search YouTube with tech-focused queries
    const videoResults = await searchYouTubeWithTechQueries(API_KEY, searchQueries);
    
    if (videoResults?.length > 0) {
      // Rank videos by relevance to extracted terms
      const rankedVideo = rankVideosByTechRelevance(videoResults, extractedTerms);
      console.log('✅ Found relevant tech video:', rankedVideo.title);
      return rankedVideo;
    }

    console.log('⚠️ No API results, using tech search fallback');
    return createTechSearchFallback(extractedTerms, articleTitle);

  } catch (error) {
    console.error('❌ YouTube service error:', error.message);
    const fallbackTerms = extractTechNounsAndConcepts(articleTitle || 'technology', articleContent);
    return createTechSearchFallback(fallbackTerms, articleTitle || 'technology');
  }
}

/**
 * Extract technology-related nouns and concepts from text
 */
function extractTechNounsAndConcepts(title, content) {
  try {
    const fullText = `${title || ''} ${content || ''}`.toLowerCase();
    const words = fullText.match(/\b\w+\b/g) || [];
    
    const extracted = {
      companies: [],
      technologies: [],
      products: [],
      programming: [],
      importantNouns: [],
      primaryTopic: '',
      searchIntent: 'explained'
    };

    // Extract known tech terms
    Object.keys(NOUN_PATTERNS).forEach(category => {
      NOUN_PATTERNS[category].forEach(term => {
        if (fullText.includes(term.toLowerCase())) {
          extracted[category].push(term);
        }
      });
    });

    // Extract important nouns from title (capitalize words, filter stop words)
    const titleWords = (title || '').toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !STOP_WORDS.includes(word) &&
        !/^\d+$/.test(word) // Filter out numbers
      )
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));

    extracted.importantNouns = [...new Set(titleWords)].slice(0, 3);

    // Determine primary topic (most relevant category)
    const categoryScores = {
      companies: extracted.companies.length * 3, // Companies are highly relevant
      technologies: extracted.technologies.length * 2,
      products: extracted.products.length * 2,
      programming: extracted.programming.length * 1.5,
      nouns: extracted.importantNouns.length
    };

    const topCategory = Object.keys(categoryScores).reduce((a, b) => 
      categoryScores[a] > categoryScores[b] ? a : b
    );

    // Set primary topic based on top category
    if (extracted.companies.length > 0) {
      extracted.primaryTopic = extracted.companies[0];
    } else if (extracted.technologies.length > 0) {
      extracted.primaryTopic = extracted.technologies[0];
    } else if (extracted.products.length > 0) {
      extracted.primaryTopic = extracted.products[0];
    } else if (extracted.importantNouns.length > 0) {
      extracted.primaryTopic = extracted.importantNouns[0];
    } else {
      extracted.primaryTopic = 'technology';
    }

    // Determine search intent
    if (fullText.includes('review') || fullText.includes('comparison')) {
      extracted.searchIntent = 'review';
    } else if (fullText.includes('tutorial') || fullText.includes('how to')) {
      extracted.searchIntent = 'tutorial';
    } else if (fullText.includes('news') || fullText.includes('announced') || fullText.includes('launches')) {
      extracted.searchIntent = 'news';
    } else if (fullText.includes('explained') || fullText.includes('what is')) {
      extracted.searchIntent = 'explained';
    }

    return extracted;

  } catch (error) {
    console.error('❌ Error extracting tech terms:', error.message);
    return {
      companies: [],
      technologies: ['technology'],
      products: [],
      programming: [],
      importantNouns: [],
      primaryTopic: 'technology',
      searchIntent: 'explained'
    };
  }
}

/**
 * Generate targeted search queries based on extracted tech terms
 */
function generateTechSearchQueries(extractedTerms) {
  const queries = [];
  
  try {
    const { companies, technologies, products, programming, importantNouns, primaryTopic, searchIntent } = extractedTerms;

    // Primary query - most specific
    if (companies.length > 0 && (technologies.length > 0 || products.length > 0)) {
      const company = companies[0];
      const tech = technologies[0] || products[0];
      queries.push(`${company} ${tech} ${searchIntent}`);
    }

    // Secondary query - topic focused
    if (primaryTopic && primaryTopic !== 'technology') {
      queries.push(`${primaryTopic} ${searchIntent} technology`);
    }

    // Technology-specific query
    if (technologies.length > 0) {
      const topTech = technologies.slice(0, 2).join(' ');
      queries.push(`${topTech} tutorial explained`);
    }

    // Product review query
    if (products.length > 0) {
      queries.push(`${products[0]} review tech analysis`);
    }

    // Programming/development query
    if (programming.length > 0) {
      queries.push(`${programming[0]} tutorial programming`);
    }

    // Noun-based query
    if (importantNouns.length > 0) {
      const topNouns = importantNouns.slice(0, 2).join(' ');
      queries.push(`${topNouns} technology explained`);
    }

    // Fallback query
    if (queries.length === 0) {
      queries.push(`${primaryTopic} technology explained`);
    }

    // Remove duplicates and limit
    return [...new Set(queries)].slice(0, 3);

  } catch (error) {
    console.error('❌ Error generating queries:', error.message);
    return [`${extractedTerms.primaryTopic || 'technology'} explained`];
  }
}

/**
 * Search YouTube with tech-focused queries
 */
async function searchYouTubeWithTechQueries(apiKey, queries) {
  const allVideos = [];
  
  for (let i = 0; i < Math.min(queries.length, 2); i++) {
    const query = queries[i];
    
    try {
      if (!quotaTracker.canMakeRequest(100)) {
        console.log('⚠️ Quota limit reached');
        break;
      }

      console.log(`🔍 YouTube search ${i + 1}: "${query}"`);

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          key: apiKey,
          maxResults: 5,
          type: 'video',
          order: 'relevance',
          publishedAfter: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 3 months
          videoDuration: 'medium',
          videoDefinition: 'high',
          videoCaption: 'any',
          relevanceLanguage: 'en'
        },
        timeout: 8000
      });

      quotaTracker.trackUsage(100);

      if (response.data.items?.length) {
        const videos = response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title || '',
          description: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle || '',
          query: query,
          source: 'youtube_api_tech'
        }));

        allVideos.push(...videos);
        console.log(`✅ Found ${videos.length} videos for "${query}"`);
      }

      // Rate limiting
      if (i < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`❌ Search failed for "${query}":`, error.message);
      
      if (error.response?.status === 403) {
        console.log('⚠️ YouTube API quota exceeded');
        break;
      }
    }
  }

  return allVideos;
}

/**
 * Rank videos by relevance to extracted tech terms
 */
function rankVideosByTechRelevance(videos, extractedTerms) {
  try {
    const { companies, technologies, products, programming, importantNouns, primaryTopic } = extractedTerms;
    
    // Combine all relevant terms for scoring
    const allRelevantTerms = [
      ...companies.map(term => ({ term, weight: 3 })),
      ...technologies.map(term => ({ term, weight: 2 })),
      ...products.map(term => ({ term, weight: 2 })),
      ...programming.map(term => ({ term, weight: 1.5 })),
      ...importantNouns.map(term => ({ term, weight: 1 }))
    ];

    // Educational channels (higher priority)
    const educationalChannels = [
      'TechCrunch', 'The Verge', 'Marques Brownlee', 'MKBHD', 'Linus Tech Tips',
      'Two Minute Papers', 'MIT', 'Stanford', 'Google', 'Microsoft', 'TED',
      'Veritasium', 'TED-Ed', 'Computerphile', 'Numberphile', 'Tech Quickie'
    ];

    const scoredVideos = videos.map(video => {
      let score = 0;
      const titleLower = (video.title || '').toLowerCase();
      const descLower = (video.description || '').toLowerCase();
      const channelLower = (video.channelTitle || '').toLowerCase();

      // Score based on term matches
      allRelevantTerms.forEach(({ term, weight }) => {
        const termLower = term.toLowerCase();
        if (titleLower.includes(termLower)) score += weight * 2; // Title matches are more important
        if (descLower.includes(termLower)) score += weight;
      });

      // Boost educational channels
      const isEducational = educationalChannels.some(channel => 
        channelLower.includes(channel.toLowerCase())
      );
      if (isEducational) score += 5;

      // Boost recent videos
      const daysOld = (Date.now() - new Date(video.publishedAt)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 2;
      else if (daysOld < 30) score += 1;

      // Penalize very short descriptions (might be low quality)
      if (video.description.length < 50) score -= 1;

      return { ...video, relevanceScore: score };
    });

    // Sort by score and return top video
    scoredVideos.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const topVideo = scoredVideos[0];
    console.log(`🏆 Top video score: ${topVideo.relevanceScore} - "${topVideo.title}"`);

    return {
      ...topVideo,
      relevance: 'high',
      ranking_method: 'tech_noun_extraction',
      extractedTerms: extractedTerms
    };

  } catch (error) {
    console.error('❌ Video ranking failed:', error.message);
    return videos[0];
  }
}

/**
 * Create enhanced search fallback using extracted tech terms
 */
function createTechSearchFallback(extractedTerms, originalTitle) {
  try {
    const { companies, technologies, products, primaryTopic, searchIntent } = extractedTerms;
    
    // Build sophisticated search query
    let searchQuery = '';
    
    if (companies.length > 0 && (technologies.length > 0 || products.length > 0)) {
      searchQuery = `${companies[0]} ${technologies[0] || products[0]} ${searchIntent}`;
    } else if (primaryTopic && primaryTopic !== 'technology') {
      searchQuery = `${primaryTopic} ${searchIntent} tutorial`;
    } else if (technologies.length > 0) {
      searchQuery = `${technologies[0]} explained tutorial`;
    } else {
      searchQuery = `${originalTitle || 'technology'} explained`;
    }

    const cleanQuery = searchQuery
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 60);

    const encodedQuery = encodeURIComponent(cleanQuery);
    
    // Generate alternative searches
    const alternatives = [];
    
    if (companies.length > 0) {
      alternatives.push({
        title: `${companies[0]} - Latest Updates`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(companies[0] + ' latest news')}`
      });
    }
    
    if (technologies.length > 0) {
      alternatives.push({
        title: `${technologies[0]} - Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(technologies[0] + ' tutorial')}`
      });
    }
    
    alternatives.push({
      title: 'Tech News Today',
      url: 'https://www.youtube.com/results?search_query=tech+news+today'
    });

    return {
      id: null,
      title: `Learn: ${cleanQuery}`,
      description: `Discover ${cleanQuery} on YouTube. Enhanced search based on AI-extracted tech concepts: ${Object.values(extractedTerms).flat().slice(0, 3).join(', ')}.`,
      thumbnail: createDynamicThumbnail(primaryTopic),
      url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
      publishedAt: new Date().toISOString(),
      channelTitle: 'YouTube Tech Search',
      relevance: 'search_tech_enhanced',
      source: 'tech_noun_fallback',
      isSearchFallback: true,
      extractedTerms: extractedTerms,
      searchAlternatives: alternatives,
      originalQuery: cleanQuery
    };

  } catch (error) {
    console.error('❌ Error creating tech fallback:', error.message);
    
    return {
      id: null,
      title: 'Learn: Technology',
      description: 'Discover technology content on YouTube.',
      thumbnail: createDynamicThumbnail('technology'),
      url: 'https://www.youtube.com/results?search_query=technology+explained',
      publishedAt: new Date().toISOString(),
      channelTitle: 'YouTube Search',
      relevance: 'search_basic',
      source: 'basic_fallback',
      isSearchFallback: true
    };
  }
}

/**
 * Create dynamic thumbnail based on tech category
 */
function createDynamicThumbnail(topic) {
  try {
    const topicLower = (topic || 'tech').toLowerCase();
    
    // Choose color based on topic category
    let color = '1e40af'; // Default blue
    
    if (topicLower.includes('ai') || topicLower.includes('intelligence')) {
      color = '7c3aed'; // Purple for AI
    } else if (topicLower.includes('blockchain') || topicLower.includes('crypto')) {
      color = 'f59e0b'; // Gold for blockchain
    } else if (topicLower.includes('security') || topicLower.includes('cyber')) {
      color = 'dc2626'; // Red for security
    } else if (topicLower.includes('green') || topicLower.includes('sustain')) {
      color = '059669'; // Green for sustainability
    } else if (topicLower.includes('mobile') || topicLower.includes('app')) {
      color = '0891b2'; // Cyan for mobile
    }
    
    const encodedTopic = encodeURIComponent(topic.substring(0, 12));
    return `https://via.placeholder.com/320x180/${color}/white?text=Tech:+${encodedTopic}`;
    
  } catch (error) {
    return 'https://via.placeholder.com/320x180/1e40af/white?text=Tech';
  }
}

/**
 * Export quota status for monitoring
 */
export function getQuotaStatus() {
  return {
    used: quotaTracker.dailyUsed,
    limit: quotaTracker.dailyLimit,
    remaining: quotaTracker.dailyLimit - quotaTracker.dailyUsed,
    resetDate: quotaTracker.lastReset
  };
}

/**
 * Export term extraction for testing
 */
export function testTermExtraction(title, content) {
  return extractTechNounsAndConcepts(title, content);
}