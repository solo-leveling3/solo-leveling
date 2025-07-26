import { useAppContext } from '@/contexts/AppContext';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ArticleDetailScreenProps {
  id: string;
  title: string;
  content: string;
  image?: string;
}

export default function ArticleDetailScreen({ id, title, content, image }: ArticleDetailScreenProps) {
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#181a20' }]}>
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, isDark && { color: '#f3f4f8' }]}>{title}</Text>
        <Text style={[styles.text, isDark && { color: '#aaa' }]}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1c1c40',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});