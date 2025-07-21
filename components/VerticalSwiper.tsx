import React, { useRef } from 'react';
import { Dimensions, View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function VerticalSwiper({ data }) {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
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
