import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Dimensions } from 'react-native';
import { dummyCards } from '@/constants/dummy';
import SwipeableCard from '@/components/SwipeableCard';

const { height, width } = Dimensions.get('window');

export default function FeedScreen() {
  const [index, setIndex] = useState(0);

  const handleSwipeUp = () => {
    if (index < dummyCards.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) setIndex(index - 1);
  };

  const renderCard = ({ item }) => (
    <SwipeableCard
      card={item}
      onSwipeUp={handleSwipeUp}
      onSwipeDown={handleSwipeDown}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[dummyCards[index]]} // Show only one card at a time
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 100} // Adjust for notch and tab bar
        decelerationRate="fast"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 20, // Space below notch
    paddingBottom: 60, // Space above tab bar
  },
});