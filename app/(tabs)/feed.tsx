import SwipeableCard from '@/components/SwipeableCard';
import { useAppContext } from '@/contexts/AppContext';
import { fetchFeedsFromFirestore } from '@/lib/firestore';
import { translateText } from '@/lib/translate';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';

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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');
  const [showRefreshSymbol, setShowRefreshSymbol] = useState(false);
  const cardOffset = React.useRef(new Animated.Value(0)).current;
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();

  const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});
  const [dislikesMap, setDislikesMap] = useState<{ [id: string]: number }>({});
  const [expandedSummaries, setExpandedSummaries] = useState<{ [id: string]: boolean }>({});

  const isMounted = useRef(true);
  async function loadCardsFromFirebase(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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

      if (isMounted.current) {
        // If refresh, check if new articles are present by comparing IDs
        if (isRefresh) {
          const currentIds = new Set(articles.map(article => article.id));
          const newArticles = translated.filter(article => !currentIds.has(article.id));
          
          if (newArticles.length > 0) {
            setRefreshMsg(`${newArticles.length} new article${newArticles.length === 1 ? '' : 's'} found!`);
            setTimeout(() => setRefreshMsg(''), 1500);
          } else {
            setRefreshMsg('No new updates found.');
            setTimeout(() => setRefreshMsg(''), 2000);
          }
        }
        setArticles(translated);
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Failed to fetch cards from Firebase');
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    isMounted.current = true;
    loadCardsFromFirebase();
    return () => {
      isMounted.current = false;
    };
  }, [language]);

  const handleSwipeUp = () => {
    if (index < articles.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      // At the top card, trigger refresh
      if (!refreshing && !showRefreshSymbol) {
        setShowRefreshSymbol(true);
        Animated.timing(cardOffset, {
          toValue: 60,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          spinAnim.setValue(0);
          Animated.loop(
            Animated.timing(spinAnim, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            })
          ).start();
          loadCardsFromFirebase(true);
          setTimeout(() => {
            Animated.timing(cardOffset, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
            setShowRefreshSymbol(false);
          }, 2000);
        });
      }
    }
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

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' && { backgroundColor: '#0c0c0c' }]}> 
      <View style={styles.stackContainer}> 
        {showRefreshSymbol && (
          <View style={[styles.refreshSymbolRow, { pointerEvents: 'none' }]}>
            <Animated.Text style={[styles.refreshSymbol, { transform: [{ rotate: spin }] }]}>⟳</Animated.Text>
          </View>
        )}
        {next && ( 
          <View style={[styles.nextCardWrapper, { pointerEvents: 'none' }]}> 
            <SwipeableCard 
              key={next.id} 
              card={cardProps(next)} 
              onSwipeUp={() => {}} 
              onSwipeDown={() => {}} 
            /> 
          </View> 
        )} 
        <Animated.View style={{ transform: [{ translateY: cardOffset }] }}>
          <SwipeableCard 
            key={current.id} 
            card={cardProps(current)} 
            onSwipeUp={handleSwipeUp} 
            onSwipeDown={handleSwipeDown} 
          />
        </Animated.View>
        {!!refreshMsg && (
          <View style={styles.refreshMsg}><Text style={styles.refreshMsgText}>{refreshMsg}</Text></View>
        )}
      </View> 
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  refreshSymbolRow: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    height: 40,
    justifyContent: 'center',
  },
  refreshSymbol: {
    fontSize: 32,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshBtn: {
    position: 'absolute',
    top: 32,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },
  refreshBtnText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  refreshMsg: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 30,
  },
  refreshMsgText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  refreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
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
