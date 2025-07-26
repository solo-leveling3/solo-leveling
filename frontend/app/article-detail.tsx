import ArticleDetailScreen from '@/components/ArticleDetailScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';

export default function ArticleDetail() {
  const params = useLocalSearchParams();
  
  return (
    <ScrollView>
      <ArticleDetailScreen
        id={params.id as string}
        title={params.title as string}
        content={params.content as string}
        image={params.image as string}
      />
    </ScrollView>
  );
}