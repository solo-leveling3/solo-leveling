import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import NewsCard from './ui/NewsCard';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const SWIPE_THRESHOLD = 120;
const SPRING_CONFIG_SNAP = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};
const SPRING_CONFIG_FAST = {
  damping: 10,
  stiffness: 400,
  mass: 0.6,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

interface SwipeableCardProps {
  card: any;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

export default function SwipeableCard({ card, onSwipeUp, onSwipeDown }: SwipeableCardProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
      rotate.value = interpolate(e.translationY, [-300, 0, 300], [-8, 0, 8]);
      scale.value = 1 - Math.min(Math.abs(e.translationY) / 1000, 0.05);
      opacity.value = 1 - Math.min(Math.abs(e.translationY) / 800, 0.2);
    })
    .onEnd(() => {
      if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-screenHeight, SPRING_CONFIG_FAST, () => {
          runOnJS(onSwipeUp)();
          translateY.value = 0;
          rotate.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
        scale.value = withSpring(0.92, SPRING_CONFIG_FAST);
        opacity.value = withSpring(0.7, SPRING_CONFIG_FAST);
      } else if (translateY.value > SWIPE_THRESHOLD) {
        translateY.value = withSpring(screenHeight, SPRING_CONFIG_FAST, () => {
          runOnJS(onSwipeDown)();
          translateY.value = 0;
          rotate.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
        scale.value = withSpring(0.92, SPRING_CONFIG_FAST);
        opacity.value = withSpring(0.7, SPRING_CONFIG_FAST);
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG_SNAP);
        rotate.value = withSpring(0, SPRING_CONFIG_SNAP);
        scale.value = withSpring(1, SPRING_CONFIG_SNAP);
        opacity.value = withSpring(1, SPRING_CONFIG_SNAP);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotateZ: `${rotate.value}deg` },
      { scale: scale.value },
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
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  fullCard: {
    width: screenWidth,
    height: screenHeight - 36,
    borderRadius: 20,
  },
});
