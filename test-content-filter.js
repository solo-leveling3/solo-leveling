import { getFeedItem, getAllHighConfidenceArticles } from './utils/rssService.js';
import { RSS_FEEDS } from './config/rssFeeds.js';

async function testContentFilter() {
  console.log('🧪 Testing Content Filter with RSS Feeds\n');
  
  // Test with a few representative feeds
  const testFeeds = [
    RSS_FEEDS.techcrunch,
    RSS_FEEDS.verge,
    RSS_FEEDS.openaiblog,
    RSS_FEEDS.wired,
    RSS_FEEDS.geekwire
  ];

  console.log('🔍 Testing individual feed processing...\n');
  
  // Test individual feed processing
  for (let i = 0; i < Math.min(3, testFeeds.length); i++) {
    const feedUrl = testFeeds[i];
    console.log(`📰 Testing feed ${i + 1}: ${feedUrl}`);
    
    try {
      const article = await getFeedItem(feedUrl, false); // Don't save to DB during testing
      
      if (article) {
        console.log(`✅ Found tech article: "${article.title}"`);
        console.log(`🎯 Confidence: ${article.techFilter.confidence}%`);
        console.log(`📊 Score: ${article.techFilter.score}`);
        console.log(`🔑 Tech keywords: ${article.techFilter.keywords.tech.join(', ')}`);
        if (article.techFilter.keywords.companies.length > 0) {
          console.log(`🏢 Companies mentioned: ${article.techFilter.keywords.companies.join(', ')}`);
        }
        console.log(`💡 Filter reasons: ${article.techFilter.reasons.join(', ')}`);
      } else {
        console.log(`❌ No qualifying tech articles found in this feed`);
      }
    } catch (error) {
      console.error(`❌ Error testing feed: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(80) + '\n');
  }

  console.log('🔍 Testing bulk high-confidence article collection...\n');
  
  // Test bulk collection with higher confidence threshold
  try {
    const highConfidenceArticles = await getAllHighConfidenceArticles(testFeeds, 70);
    
    console.log(`📊 Results Summary:`);
    console.log(`   Total articles found: ${highConfidenceArticles.length}`);
    
    if (highConfidenceArticles.length > 0) {
      console.log(`   Highest confidence: ${highConfidenceArticles[0].techFilter.confidence}%`);
      console.log(`   Lowest confidence: ${highConfidenceArticles[highConfidenceArticles.length - 1].techFilter.confidence}%`);
      
      console.log('\n🏆 Top 3 Tech Articles:');
      for (let i = 0; i < Math.min(3, highConfidenceArticles.length); i++) {
        const article = highConfidenceArticles[i];
        console.log(`\n${i + 1}. "${article.title}"`);
        console.log(`   Source: ${article.feedTitle}`);
        console.log(`   Confidence: ${article.techFilter.confidence}%`);
        console.log(`   Keywords: ${article.techFilter.keywords.tech.slice(0, 3).join(', ')}`);
        console.log(`   Link: ${article.link}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error in bulk collection: ${error.message}`);
  }

  console.log('\n✅ Content filter testing completed!');
}

// Run the test
testContentFilter().catch(console.error);
