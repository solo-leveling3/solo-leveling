import NewsCard from '@/components/ui/NewsCard';
import SavedCard from '@/components/ui/SavedCard';
import type { SavedArticle } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';
import React from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SavedScreen() {
  const { savedArticles, removeSavedArticle, saveArticle, isArticleSaved, theme } = useAppContext();
  const [openArticle, setOpenArticle] = React.useState<SavedArticle | null>(null);

  const handleToggleSave = (articleId: string) => {
    if (isArticleSaved(articleId)) {
      removeSavedArticle(articleId);
      if (openArticle && openArticle.id === articleId) {
        // Update the openArticle state to reflect unsaved state
        setOpenArticle({ ...openArticle });
      }
    } else {
      // Re-save the article with current timestamp
      if (openArticle && openArticle.id === articleId) {
        saveArticle({ ...openArticle, savedAt: Date.now() });
      }
    }
  };

  const renderSavedArticle = ({ item, index }: { item: SavedArticle; index: number }) => {
    return (
      <SavedCard
        title={item.title}
        summary={item.summary}
        image={item.image}
        savedAt={item.savedAt}
        onRemove={() => handleToggleSave(item.id)}
        onPress={() => setOpenArticle(item)}
        theme={theme}
      />
    );
  };

  if (savedArticles.length === 0) {
    return (
      <View style={[styles.container, theme === 'dark' && { backgroundColor: '#181a20' }]}>
        <View style={styles.centerContent}>
          <Text style={styles.icon}>🔖</Text>
          <Text style={[styles.title, theme === 'dark' && { color: '#f3f4f8' }]}>Saved News</Text>
          <Text style={[styles.text, theme === 'dark' && { color: '#aaa' }]}>Your bookmarked news will appear here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === 'dark' && { backgroundColor: '#181a20' }]}>
      <Text style={[styles.headerTitle, theme === 'dark' && { color: '#f3f4f8' }]}>Saved Articles ({savedArticles.length})</Text>
      <FlatList<SavedArticle>
        data={[...savedArticles].sort((a, b) => b.savedAt - a.savedAt)} // Sort by most recent first
        renderItem={({ item, index }) => renderSavedArticle({ item, index })}
        keyExtractor={(item) => item.id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <Modal visible={!!openArticle} animationType="slide" onRequestClose={() => setOpenArticle(null)}>
        {openArticle && (
          <NewsCard
            title={openArticle.title}
            summary={openArticle.summary}
            why={openArticle.why}
            upskill={openArticle.upskill}
            sourceUrl={openArticle.sourceUrl}
            image={openArticle.image}
            isSaved={isArticleSaved(openArticle.id)}
            onToggleSave={() => handleToggleSave(openArticle.id)}
            timestamp={openArticle.savedAt}
          />
        )}
        <Pressable onPress={() => setOpenArticle(null)} style={{ position: 'absolute', top: 40, right: 20, backgroundColor: theme === 'dark' ? '#23262f' : '#fff', borderRadius: 20, padding: 10, elevation: 4 }}>
          <Text style={{ fontWeight: 'bold', color: theme === 'dark' ? '#a084ee' : '#4c68ff' }}>Close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // overridden inline for dark
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
    color: '#555', // overridden inline for dark
    textAlign: 'center',
  },
});
