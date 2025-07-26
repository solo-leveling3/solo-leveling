import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface SwiperItem {
  id: string;
  title: string;
  summary: string;
}

interface VerticalSwiperProps {
  data: SwiperItem[];
}

export default function VerticalSwiper({ data }: VerticalSwiperProps) {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={(item: SwiperItem) => item.id}
      renderItem={({ item }: { item: SwiperItem }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.summary}>{item.summary}</Text>
        </View>
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    height,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  summary: {
    fontSize: 18,
    color: '#555',
  },
});
