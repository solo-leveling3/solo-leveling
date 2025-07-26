/**
 * Content filtering service to ensure only tech-related articles
 */
export class ContentFilterService {
  
  // Tech-related keywords (must have at least one)
  static techKeywords = [
    // Core Technology
    'technology', 'tech', 'digital', 'software', 'hardware', 'app', 'application',
    'platform', 'system', 'network', 'internet', 'web', 'mobile', 'smartphone',
    'computer', 'laptop', 'device', 'gadget', 'electronics', 'semiconductor',
    
    // AI & Machine Learning
    'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural',
    'algorithm', 'automation', 'robotics', 'chatbot', 'nlp', 'computer vision',
    
    // Programming & Development
    'programming', 'coding', 'developer', 'software development', 'api', 'framework',
    'database', 'cloud computing', 'devops', 'open source', 'github', 'code',
    
    // Emerging Tech
    'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'nft', 'metaverse',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'iot', 'internet of things',
    'quantum computing', '5g', '6g', 'edge computing',
    
    // Cybersecurity
    'cybersecurity', 'security', 'privacy', 'encryption', 'hack', 'breach',
    'malware', 'phishing', 'vulnerability', 'firewall',
    
    // Companies & Products
    'apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'tesla',
    'netflix', 'uber', 'spotify', 'twitter', 'instagram', 'tiktok', 'zoom',
    'slack', 'discord', 'github', 'openai', 'nvidia', 'intel', 'amd',
    'iphone', 'android', 'windows', 'macos', 'ios', 'chrome', 'safari',
    
    // Business Tech
    'startup', 'fintech', 'healthtech', 'edtech', 'saas', 'e-commerce',
    'digital transformation', 'innovation', 'venture capital', 'ipo',
    
    // Data & Analytics
    'data', 'analytics', 'big data', 'data science', 'business intelligence',
    'dashboard', 'metrics', 'cloud', 'aws', 'azure', 'gcp'
  ];

  // Non-tech keywords (exclude if these are primary focus)
  static excludeKeywords = [
    // Politics & Government
    'politics', 'political', 'government', 'congress', 'senate', 'president',
    'election', 'vote', 'campaign', 'policy', 'law', 'regulation', 'court',
    
    // Sports & Entertainment
    'sports', 'football', 'basketball', 'baseball', 'soccer', 'olympics',
    'movie', 'film', 'celebrity', 'entertainment', 'music', 'album', 'concert',
    
    // Health & Medical (unless tech-related)
    'health', 'medical', 'hospital', 'doctor', 'patient', 'disease', 'virus',
    'vaccine', 'medicine', 'treatment', 'cancer', 'covid',
    
    // Finance (unless fintech)
    'stock market', 'wall street', 'banking', 'loan', 'mortgage', 'insurance',
    'real estate', 'property', 'housing',
    
    // General News
    'weather', 'climate', 'environment', 'nature', 'travel', 'food', 'recipe',
    'fashion', 'beauty', 'lifestyle', 'culture', 'art', 'book', 'education'
  ];

  // Tech company names for higher relevance
  static techCompanies = [
    'apple', 'google', 'microsoft', 'amazon', 'meta', 'tesla', 'netflix',
    'uber', 'spotify', 'airbnb', 'dropbox', 'slack', 'zoom', 'github',
    'openai', 'nvidia', 'intel', 'amd', 'qualcomm', 'broadcom', 'cisco',
    'oracle', 'salesforce', 'adobe', 'vmware', 'snowflake', 'databricks'
  ];

  /**
   * Check if article is tech-related
   * @param {Object} article - Article object with title, description, content
   * @returns {Object} - { isTechRelated: boolean, confidence: number, reasons: array }
   */
  static filterTechContent(article) {
    const fullText = this.extractText(article).toLowerCase();
    const title = (article.title || '').toLowerCase();
    
    let score = 0;
    let reasons = [];

    // 1. Check tech keywords in title (higher weight)
    const titleTechKeywords = this.techKeywords.filter(keyword => 
      title.includes(keyword)
    );
    if (titleTechKeywords.length > 0) {
      score += titleTechKeywords.length * 3; // 3 points per title keyword
      reasons.push(`Tech keywords in title: ${titleTechKeywords.join(', ')}`);
    }

    // 2. Check tech keywords in content
    const contentTechKeywords = this.techKeywords.filter(keyword => 
      fullText.includes(keyword)
    );
    if (contentTechKeywords.length > 0) {
      score += contentTechKeywords.length; // 1 point per content keyword
      reasons.push(`Tech keywords found: ${contentTechKeywords.slice(0, 5).join(', ')}`);
    }

    // 3. Check for tech companies (higher relevance)
    const mentionedCompanies = this.techCompanies.filter(company => 
      fullText.includes(company)
    );
    if (mentionedCompanies.length > 0) {
      score += mentionedCompanies.length * 2; // 2 points per company
      reasons.push(`Tech companies mentioned: ${mentionedCompanies.join(', ')}`);
    }

    // 4. Penalty for non-tech keywords
    const excludedKeywords = this.excludeKeywords.filter(keyword => 
      title.includes(keyword) || fullText.includes(keyword)
    );
    if (excludedKeywords.length > 0) {
      score -= excludedKeywords.length * 2; // -2 points per excluded keyword
      reasons.push(`Non-tech keywords found: ${excludedKeywords.join(', ')}`);
    }

    // 5. Source-based scoring (if RSS feed is tech-focused)
    const techSources = [
      'techcrunch', 'verge', 'wired', 'arstechnica', 'engadget', 'zdnet',
      'techradar', 'cnet', 'venturebeat', 'geekwire'
    ];
    const source = article.source || article.feedTitle || '';
    if (techSources.some(techSource => source.toLowerCase().includes(techSource))) {
      score += 2;
      reasons.push('From tech-focused source');
    }

    // 6. Calculate confidence
    const maxPossibleScore = 15; // Reasonable max for very tech-heavy article
    const confidence = Math.min(Math.max(score / maxPossibleScore, 0), 1);

    // 7. Determine if tech-related (threshold: score >= 3 OR confidence >= 0.3)
    const isTechRelated = score >= 3 || confidence >= 0.3;

    return {
      isTechRelated,
      confidence: Math.round(confidence * 100), // Convert to percentage
      score,
      reasons,
      keywords: {
        tech: titleTechKeywords.concat(contentTechKeywords.slice(0, 3)),
        companies: mentionedCompanies,
        excluded: excludedKeywords
      }
    };
  }

  /**
   * Extract text from article for analysis
   */
  static extractText(article) {
    const text = [
      article.title || '',
      article.description || '',
      article.contentSnippet || '',
      article.content || '',
      article.summary || ''
    ].join(' ');

    return text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Filter multiple articles
   */
  static filterTechArticles(articles, minConfidence = 30) {
    return articles
      .map(article => ({
        ...article,
        techFilter: this.filterTechContent(article)
      }))
      .filter(article => 
        article.techFilter.isTechRelated && 
        article.techFilter.confidence >= minConfidence
      )
      .sort((a, b) => b.techFilter.confidence - a.techFilter.confidence); // Sort by confidence
  }
}