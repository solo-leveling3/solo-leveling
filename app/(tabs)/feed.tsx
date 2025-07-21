import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { dummyCards } from '@/constants/dummy';
import SwipeableCard from '@/components/SwipeableCard';

export default function FeedScreen() {
  const [index, setIndex] = useState(0);

  const handleSwipeUp = () => {
    if (index < dummyCards.length - 1) setIndex(index + 1);
  };

  const handleSwipeDown = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View style={styles.container}>
      {dummyCards
        .slice(index, index + 2)
        .reverse()
        .map((card, i) => (
          <SwipeableCard
            key={card.id}
            card={card}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
});
