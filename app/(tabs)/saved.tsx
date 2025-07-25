import NewsCard from '@/components/ui/NewsCard';
import type { SavedArticle } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SavedScreen() {
  const { savedArticles, removeSavedArticle, isArticleSaved } = useAppContext();
  const { t } = useTranslation();

  const handleToggleSave = (articleId: string) => {
    removeSavedArticle(articleId);
  };

  const renderSavedArticle = ({ item, index }: { item: SavedArticle; index: number }) => {
    const savedDate = new Date(item.savedAt);
    const formattedDate = savedDate.toLocaleDateString() + ' ' + savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Alternate card styles
    const cardBg = index % 2 === 0 ? '#f8faff' : '#f3f4f8';
    const borderColor = index % 2 === 0 ? '#4c68ff' : '#a084ee';
    return (
      <View style={[styles.cardContainer, { backgroundColor: cardBg, borderLeftColor: borderColor, borderLeftWidth: 5, shadowColor: borderColor }]}> 
        <View style={styles.timestampContainer}>
          <Text style={[styles.timestampText, { color: borderColor, fontWeight: '700', fontStyle: 'normal' }]}>{t('saved.savedOn')} {formattedDate}</Text>
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
          style={{ margin: 0, borderRadius: 16, boxShadow: '0 2px 8px rgba(76,104,255,0.07)' }}
        />
      </View>
    );
  };

  if (savedArticles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.icon}>🔖</Text>
          <Text style={styles.title}>{t('saved.savedNews')}</Text>
          <Text style={styles.text}>{t('saved.bookmarkedNewsWillAppear')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('saved.savedArticlesCount')} ({savedArticles.length})</Text>
      <FlatList<SavedArticle>
        data={[...savedArticles].sort((a, b) => b.savedAt - a.savedAt)} // Sort by most recent first
        renderItem={({ item, index }) => renderSavedArticle({ item, index })}
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
    marginBottom: 20,
    borderRadius: 18,
    borderLeftWidth: 5,
    backgroundColor: '#f8faff',
    shadowColor: '#4c68ff',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  timestampContainer: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  timestampText: {
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'normal',
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
