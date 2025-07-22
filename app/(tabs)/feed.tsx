import SwipeableCard from '@/components/SwipeableCard';
import { useAppContext } from '@/contexts/AppContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const NEWSAPI_KEY = '7bc2ad6714d940b6830421fb312978c3'; // <-- Replace with your NewsAPI key
const GNEWS_KEY = '862e6ae6561cf46301ff6c8f64ff5419';     // <-- Replace with your GNews key
const GEMINI_API_KEY = 'AIzaSyAtXAm3o30_yx8gHnfr66TWZVvVAgjhmGA';

// Helper to translate text using Google Translate API (free endpoint)
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0]?.map((t: any) => t[0]).join('') || text;
  } catch {
    return text;
  }
}

// Always generate summary in English, then translate if needed
async function generateGeminiSummary(title: string, summary: string): Promise<{ why: string, upskill: string }> {
  const prompt = `You are an expert technology and AI news explainer. Given this news article:\nTitle: ${title}\nSummary: ${summary}\n\nPlease answer the following:\n1. Why does this news matter for tech/AI professionals? (2-3 sentences)\n2. How can someone upskill or take action based on this news? (1-2 sentences)\n\nFormat your response as:\n1. <why it matters>\n2. <how to upskill>\n`;
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  let why = '', upskill = '';
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const whyMatch = text.match(/1\.(.*?)(?:2\.|$)/s);
    const upskillMatch = text.match(/2\.(.*)/s);
    why = whyMatch ? whyMatch[1].trim() : '';
    upskill = upskillMatch ? upskillMatch[1].trim() : '';
    if (!why && !upskill) {
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
  const { language, saveArticle, removeSavedArticle, isArticleSaved } = useAppContext();
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
        // Always fetch in English
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
      } catch {
        setError('Failed to fetch from NewsAPI');
      }
      try {
        // Always fetch in English
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
      } catch {
        setError((prev) => prev ? prev + ' & GNews' : 'Failed to fetch from GNews');
      }
      const merged = [...newsapiArticles, ...gnewsArticles];
      // Filter for tech/AI news only (title or summary must contain keywords)
      const techKeywords = /\b(tech|ai|artificial intelligence|machine learning|robot|software|hardware|data|cloud|computing|programming|developer|engineer|cyber|blockchain|crypto|automation|gpt|openai|google|microsoft|apple|amazon|chip|quantum|startup|internet|web|mobile|app|virtual|iot|network|security|algorithm|deep|vision|autonomous|drone|analytics|saas|devops|coding|python|javascript|react|tensorflow|pytorch|gemini|chatgpt|copilot)\b/i;
      const filtered = merged.filter(
        (a) => techKeywords.test((a.title || '') + ' ' + (a.summary || ''))
      );
      // Gemini summarization and translation
      let summarized: any[] = [];
      if (filtered.length > 0) {
        setLoading(true);
        summarized = await Promise.all(
          filtered.map(async (article) => {
            try {
              // Only call Gemini if title or summary is not empty
              if ((article.title && article.title.trim()) || (article.summary && article.summary.trim())) {
                const { why, upskill } = await generateGeminiSummary(article.title, article.summary);
                // Translate all fields if needed
                const [titleT, summaryT, whyT, upskillT] = await Promise.all([
                  translateText(article.title, language),
                  translateText(article.summary, language),
                  translateText(why, language),
                  translateText(upskill, language),
                ]);
                return {
                  ...article,
                  title: titleT,
                  summary: summaryT,
                  why: whyT || '(No summary generated by Gemini)',
                  upskill: upskillT || '(No upskill advice generated by Gemini)',
                };
              } else {
                return {
                  ...article,
                  why: '(No title/summary)',
                  upskill: '(No title/summary)',
                };
              }
            } catch {
              return {
                ...article,
                why: '(Gemini API error)',
                upskill: '(Gemini API error)',
              };
            }
          })
        );
      }
      setArticles(summarized);
      setLoading(false);
    }
    fetchNews();
    interval = setInterval(fetchNews, 60 * 60 * 1000); // Refresh every 1 hour
    return () => clearInterval(interval);
  }, [language]);

  const handleSwipeUp = () => {
    if (index < articles.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) setIndex(index - 1);
  };

  const currentCard = articles[index];
  const nextCard = articles[index + 1];

  // Handle save/unsave functionality
  const handleToggleSave = (article: any) => {
    if (isArticleSaved(article.id)) {
      removeSavedArticle(article.id);
    } else {
      saveArticle({
        id: article.id,
        title: article.title,
        summary: article.summary,
        why: article.why,
        upskill: article.upskill,
        sourceUrl: article.sourceUrl,
        image: article.image,
        savedAt: Date.now()
      });
    }
  };

  // Add save functionality to current card
  const currentCardWithSave = currentCard ? {
    ...currentCard,
    isSaved: isArticleSaved(currentCard.id),
    onToggleSave: () => handleToggleSave(currentCard)
  } : null;

  const nextCardWithSave = nextCard ? {
    ...nextCard,
    isSaved: isArticleSaved(nextCard.id),
    onToggleSave: () => handleToggleSave(nextCard)
  } : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading news...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubText}>Please check your internet connection and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCardWithSave) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>No news articles found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stackContainer}>
        {nextCardWithSave && (
          <View style={styles.nextCardWrapper} pointerEvents="none">
            <SwipeableCard card={nextCardWithSave} onSwipeUp={() => {}} onSwipeDown={() => {}} />
          </View>
        )}
        {currentCardWithSave && (
          <SwipeableCard card={currentCardWithSave} onSwipeUp={handleSwipeUp} onSwipeDown={handleSwipeDown} />
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
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});