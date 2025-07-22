import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import NewsCard from './ui/NewsCard';

const { height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function SwipeableCard({ card, onSwipeUp, onSwipeDown }) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-screenHeight, {}, () => {
          runOnJS(onSwipeUp)();
          translateY.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
      } else if (translateY.value > SWIPE_THRESHOLD) {
        translateY.value = withTiming(screenHeight, {}, () => {
          runOnJS(onSwipeDown)();
          translateY.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: withTiming(scale.value) },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <NewsCard {...card} style={styles.fullCard} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  fullCard: {
    width: '90%',
    maxHeight: screenHeight - 120, // Adjust for notch and tab bar padding
  },
});