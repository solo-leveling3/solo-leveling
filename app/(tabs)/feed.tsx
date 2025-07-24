import SwipeableCard from '@/components/SwipeableCard';
import { useAppContext } from '@/contexts/AppContext';
import { fetchFeedsFromFirestore } from '@/lib/firestore';
import { translateText } from '@/lib/translate';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';

function cleanBulletPoints(text: string) {
  return text
    .split('•')
    .map((line) =>
      line
        .trim()
        .replace(/^\*\*[^*]+\*\*:?:?\s*/, '')
        .replace(/^[^:\n\r]+:\s*/, '')
    )
    .filter(Boolean)
    .map((point) => `• ${point}`)
    .join('\n');
}

function parseCardSummary(summary: string) {
  const titleMatch = summary.match(/🔖 Headline:\s*(.*?)\s*(?:✏|$)/);
  const summaryMatch = summary.match(/✏ Summary:\s*(.*?)\s*(?:❗|$)/);
  const whyMatch = summary.match(/❗ Why it's Useful:\s*(.*?)\s*(?:🚀|$)/);
  const upskillMatch = summary.match(/🚀 Key Takeaways?:\s*([\s\S]*)/);

  return {
    title: titleMatch?.[1]?.trim() || '',
    summary: summaryMatch?.[1]?.trim() || '',
    why: whyMatch?.[1]?.trim() || 'No insight available yet.',
    upskill: upskillMatch?.[1] ? cleanBulletPoints(upskillMatch[1].trim()) : 'No upskill advice yet.',
  };
}

export default function FeedScreen() {
  const { language, saveArticle, removeSavedArticle, isArticleSaved } = useAppContext();
  const [articles, setArticles] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();

  const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});
  const [dislikesMap, setDislikesMap] = useState<{ [id: string]: number }>({});
  const [expandedSummaries, setExpandedSummaries] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadCardsFromFirebase() {
      try {
        setLoading(true);
        const firebaseCards = await fetchFeedsFromFirestore();

        const uniqueCards = Array.from(new Map(firebaseCards.map(item => [item.id, item])).values());
        uniqueCards.sort((a, b) => b.timestamp - a.timestamp);

        const parsed = uniqueCards.map((card) => {
          const parsedSummary = parseCardSummary(card.summary || '');
          return {
            ...card,
            title: parsedSummary.title || card.title,
            summary: parsedSummary.summary,
            why: parsedSummary.why,
            upskill: parsedSummary.upskill,
            sourceUrl: card.link,
          };
        });

        const translated = await Promise.all(
          parsed.map(async (card) => {
            const [titleT, summaryT, whyT, upskillT] = await Promise.all([
              translateText(card.title, language),
              translateText(card.summary, language),
              translateText(card.why, language),
              translateText(card.upskill, language),
            ]);
            return {
              ...card,
              title: titleT,
              summary: summaryT,
              why: whyT,
              upskill: upskillT,
            };
          })
        );

        if (isMounted) {
          setArticles(translated);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch cards from Firebase');
        setLoading(false);
      }
    }

    loadCardsFromFirebase();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const handleSwipeUp = () => {
    if (index < articles.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleToggleSave = (article: any) => {
    if (isArticleSaved(article.id)) {
      removeSavedArticle(article.id);
    } else {
      saveArticle({ ...article, savedAt: Date.now() });
    }
  };

  const handleLike = (id: string) => {
    setLikesMap((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    if (dislikesMap[id]) {
      setDislikesMap((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
    }
  };

  const handleDislike = (id: string) => {
    setDislikesMap((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    if (likesMap[id]) {
      setLikesMap((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
    }
  };

  const current = articles[index];
  const next = articles[index + 1];

  const cardProps = (article: any) =>
    article
      ? {
          ...article,
          sourceUrl: article.sourceUrl,
          isSaved: isArticleSaved(article.id),
          onToggleSave: () => handleToggleSave(article),
          onLike: () => handleLike(article.id),
          onDislike: () => handleDislike(article.id),
          likeCount: likesMap[article.id] ?? article.likeCount ?? 0,
          dislikeCount: dislikesMap[article.id] ?? article.dislikeCount ?? 0,
          summaryExpanded: expandedSummaries[article.id] || false,
          onToggleSummary: () => setExpandedSummaries((prev) => ({ ...prev, [article.id]: !prev[article.id] })),
        }
      : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading personalized tech news...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubText}>Please check your internet or Firebase config.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>No articles available. Try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' && { backgroundColor: '#0c0c0c' }]}>
      <View style={styles.stackContainer}>
        {next && (
          <View style={styles.nextCardWrapper} pointerEvents="none">
            <SwipeableCard
              key={next.id}
              card={cardProps(next)}
              onSwipeUp={() => {}}
              onSwipeDown={() => {}}
            />
          </View>
        )}
        <SwipeableCard
          key={current.id}
          card={cardProps(current)}
          onSwipeUp={handleSwipeUp}
          onSwipeDown={handleSwipeDown}
        />
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
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
