import NewsCard from '@/components/ui/NewsCard';
import type { SavedArticle } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SavedScreen() {
  const { savedArticles, removeSavedArticle, isArticleSaved } = useAppContext();

  const handleToggleSave = (articleId: string) => {
    removeSavedArticle(articleId);
  };

  const renderSavedArticle = ({ item }: { item: SavedArticle }) => {
    const savedDate = new Date(item.savedAt);
    const formattedDate = savedDate.toLocaleDateString() + ' ' + savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={styles.cardContainer}>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>Saved on {formattedDate}</Text>
        </View>
        <NewsCard
          title={item.title}
          summary={item.summary}
          why={item.why}
          upskill={item.upskill}
          sourceUrl={item.sourceUrl}
          image={item.image}
          isSaved={isArticleSaved(item.id)}
          onToggleSave={() => handleToggleSave(item.id)}
          // Provide undefined for optional props
          youtube={undefined}
          likeCount={0}
          dislikeCount={0}
          onLike={undefined}
          onDislike={undefined}
        />
      </View>
    );
  };

  if (savedArticles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.icon}>🔖</Text>
          <Text style={styles.title}>Saved News</Text>
          <Text style={styles.text}>Your bookmarked news will appear here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Saved Articles ({savedArticles.length})</Text>
      <FlatList<SavedArticle>
        data={[...savedArticles].sort((a, b) => b.savedAt - a.savedAt)} // Sort by most recent first
        renderItem={renderSavedArticle}
        keyExtractor={(item) => item.id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 16,
  },
  timestampContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
