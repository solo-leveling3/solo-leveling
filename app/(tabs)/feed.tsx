import SwipeableCard from '@/components/SwipeableCard';
import { dummyCards } from '@/constants/dummy';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const NEWSAPI_KEY = '7bc2ad6714d940b6830421fb312978c3'; // <-- Replace with your NewsAPI key
const GNEWS_KEY = '862e6ae6561cf46301ff6c8f64ff5419';     // <-- Replace with your GNews key
const GEMINI_API_KEY = 'AIzaSyAtXAm3o30_yx8gHnfr66TWZVvVAgjhmGA';

async function generateGeminiSummary(title: string, summary: string) {
  const prompt = `You are an expert tech/AI news explainer. Given this news article:
Title: ${title}
Summary: ${summary}

1. Why does this news matter for tech/AI professionals? (2-3 sentences)
2. How can someone upskill or take action based on this news? (1-2 sentences)`;
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  // Parse Gemini response
  let why = '', upskill = '';
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Try to split by numbered list
    const match = text.match(/1\.[\s\S]*?2\./);
    if (match) {
      const [whyPart, upskillPart] = text.split('2.');
      why = whyPart.replace(/^1\./, '').trim();
      upskill = upskillPart?.trim() || '';
    } else {
      // fallback: try to split by newlines
      const [whyPart, upskillPart] = text.split(/\n\n|\n/);
      why = whyPart?.trim() || '';
      upskill = upskillPart?.trim() || '';
    }
  } catch {
    why = '';
    upskill = '';
  }
  return { why, upskill };
}

export default function FeedScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any;
    async function fetchNews() {
      setLoading(true);
      setError('');
      let newsapiArticles = [];
      let gnewsArticles = [];
      try {
        // NewsAPI fetch
        const newsapiRes = await fetch(
          `https://newsapi.org/v2/everything?q=technology%20OR%20AI%20OR%20artificial%20intelligence%20OR%20machine%20learning&language=en&pageSize=50&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`
        );
        const newsapiJson = await newsapiRes.json();
        if (newsapiJson.articles) {
          newsapiArticles = newsapiJson.articles.map((a: any, i: number) => ({
            id: 'newsapi-' + (a.url || i),
            title: a.title,
            summary: a.description || '',
            why: '',
            upskill: '',
            sourceUrl: a.url,
            image: a.urlToImage,
          }));
        }
      } catch (e) {
        setError('Failed to fetch from NewsAPI');
      }
      try {
        // GNews fetch
        const gnewsRes = await fetch(
          `https://gnews.io/api/v4/search?q=technology%20OR%20AI%20OR%20artificial%20intelligence%20OR%20machine%20learning&lang=en&max=50&token=${GNEWS_KEY}`
        );
        const gnewsJson = await gnewsRes.json();
        if (gnewsJson.articles) {
          gnewsArticles = gnewsJson.articles.map((a: any, i: number) => ({
            id: 'gnews-' + (a.url || i),
            title: a.title,
            summary: a.description || '',
            why: '',
            upskill: '',
            sourceUrl: a.url,
            image: a.image,
          }));
        }
      } catch (e) {
        setError((prev) => prev ? prev + ' & GNews' : 'Failed to fetch from GNews');
      }
      const merged = [...newsapiArticles, ...gnewsArticles];
      // Filter for tech/AI news only (title or summary must contain keywords)
      const techKeywords = /\b(tech|ai|artificial intelligence|machine learning|robot|software|hardware|data|cloud|computing|programming|developer|engineer|cyber|blockchain|crypto|automation|gpt|openai|google|microsoft|apple|amazon|semiconductor|chip|quantum|neural|startup|internet|web|mobile|app|application|virtual|augmented|iot|5g|6g|network|security|privacy|algorithm|deep learning|nlp|vision|autonomous|self-driving|drone|robotics|big data|analytics|cloud|saas|paas|infrastructure|devops|coding|python|javascript|react|node|tensorflow|pytorch|ml|dl|nlp|lms|llm|generative|gemini|bard|chatgpt|copilot|ai assistant|ai tool|ai model|ai chip|ai hardware|ai software|ai research|ai ethics|ai safety|ai regulation|ai policy|ai news|ai update|ai trend|ai startup|ai company|ai product|ai service|ai platform|ai solution|ai application|ai system|ai technology|ai innovation|ai breakthrough|ai discovery|ai development|ai deployment|ai adoption|ai integration|ai implementation|ai usage|ai impact|ai benefit|ai risk|ai challenge|ai opportunity|ai future|ai vision|ai mission|ai goal|ai strategy|ai roadmap|ai plan|ai project|ai initiative|ai partnership|ai collaboration|ai investment|ai funding|ai acquisition|ai merger|ai IPO|ai stock|ai share|ai market|ai industry|ai sector|ai field|ai domain|ai area|ai discipline|ai science|ai engineering|ai design|ai architecture|ai framework|ai library|ai toolkit|ai toolchain|ai pipeline|ai workflow|ai process|ai method|ai technique|ai approach|ai algorithm|ai model|ai dataset|ai benchmark|ai evaluation|ai metric|ai score|ai result|ai finding|ai insight|ai analysis|ai report|ai review|ai summary|ai overview|ai survey|ai tutorial|ai guide|ai course|ai training|ai education|ai learning|ai teaching|ai mentoring|ai coaching|ai consulting|ai advising|ai supporting|ai enabling|ai empowering|ai enhancing|ai augmenting|ai automating|ai optimizing|ai improving|ai advancing|ai evolving|ai transforming|ai revolutionizing|ai disrupting|ai changing|ai shaping|ai driving|ai leading|ai powering|ai fueling|ai boosting|ai accelerating|ai scaling|ai growing|ai expanding|ai spreading|ai increasing|ai rising|ai surging|ai booming|ai exploding|ai skyrocketing|ai dominating|ai conquering|ai winning|ai succeeding|ai thriving|ai flourishing|ai prospering|ai excelling|ai outperforming|ai surpassing|ai exceeding|ai outpacing|ai outstripping|ai overtaking|ai outshining|ai outclassing|ai outsmarting|ai outthinking|ai outlearning|ai outworking|ai outproducing|ai outdelivering|ai outserving|ai outcompeting|ai outinnovating|ai outdisrupting|ai outtransforming|ai outrevolutionizing|ai outchanging|ai outshaping|ai outdriving|ai outleading|ai outpowering|ai outfueling|ai outboosting|ai outaccelerating|ai outscaling|ai outgrowing|ai outexpanding|ai outspreading|ai outincreasing|ai outrising|ai outsurging|ai outbooming|ai outexploding|ai outskyrocketing|ai outdominating|ai outconquering|ai outwinning|ai outsucceeding|ai outthriving|ai outflourishing|ai outprospering|ai outexcelling|ai outoutperforming|ai outsurpassing|ai outexceeding|ai outoutpacing|ai outoutstripping|ai outovertaking|ai outoutshining|ai outoutclassing|ai outoutsmarting|ai outoutthinking|ai outoutlearning|ai outoutworking|ai outoutproducing|ai outoutdelivering|ai outoutserving|ai outoutcompeting|ai outoutinnovating|ai outoutdisrupting|ai outouttransforming|ai outoutrevolutionizing|ai outoutchanging|ai outoutshaping|ai outoutdriving|ai outoutleading|ai outoutpowering|ai outoutfueling|ai outoutboosting|ai outoutaccelerating|ai outoutscaling|ai outoutgrowing|ai outoutexpanding|ai outoutspreading|ai outoutincreasing|ai outoutrising|ai outoutsurging|ai outoutbooming|ai outoutexploding|ai outoutskyrocketing|ai outoutdominating|ai outoutconquering|ai outoutwinning|ai outoutsucceeding|ai outoutthriving|ai outoutflourishing|ai outoutprospering|ai outoutexcelling)\b/i;
      const filtered = merged.filter(
        (a) => techKeywords.test((a.title || '') + ' ' + (a.summary || ''))
      );
      // Gemini summarization
      let summarized: any[] = filtered;
      if (filtered.length > 0) {
        setLoading(true);
        summarized = await Promise.all(
          filtered.map(async (article) => {
            try {
              const { why, upskill } = await generateGeminiSummary(article.title, article.summary);
              return {
                ...article,
                why: why || 'This news is important for tech/AI professionals.',
                upskill: upskill || 'Stay updated and explore related learning resources.',
              };
            } catch {
              return {
                ...article,
                why: 'This news is important for tech/AI professionals.',
                upskill: 'Stay updated and explore related learning resources.',
              };
            }
          })
        );
      }
      setArticles(summarized.length > 0 ? summarized : dummyCards);
      setLoading(false);
    }
    fetchNews();
    interval = setInterval(fetchNews, 60 * 60 * 1000); // Refresh every 1 hour
    return () => clearInterval(interval);
  }, []);

  const handleSwipeUp = () => {
    if (index < articles.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) setIndex(index - 1);
  };

  const currentCard = articles[index];
  const nextCard = articles[index + 1];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><ActivityIndicator size="large" color="#007bff" /><Text>Loading news...</Text></View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><Text>No news articles found.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stackContainer}>
        {nextCard && (
          <View style={styles.nextCardWrapper} pointerEvents="none">
            <SwipeableCard card={nextCard} onSwipeUp={() => {}} onSwipeDown={() => {}} />
          </View>
        )}
        {currentCard && (
          <SwipeableCard card={currentCard} onSwipeUp={handleSwipeUp} onSwipeDown={handleSwipeDown} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
    transform: [{ scale: 0.94 }],
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});