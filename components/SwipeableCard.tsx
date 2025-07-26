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
  damping: 20,
  stiffness: 200,
  mass: 0.6,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};
const SPRING_CONFIG_FAST = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};


type SwipeStyle = 'rotate' | 'fade' | 'scale';
interface SwipeableCardProps {
  card: any;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  swipeStyle?: SwipeStyle;
}


export default function SwipeableCard({ card, onSwipeUp, onSwipeDown, swipeStyle }: SwipeableCardProps) {
  // Cycle through styles if not provided
  const styleList: SwipeStyle[] = ['rotate', 'fade', 'scale'];
  const cardIndex = card && card.id ? (parseInt(card.id, 36) % styleList.length) : 0;
  const styleToUse: SwipeStyle = swipeStyle || styleList[cardIndex];

  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10]) // Only activate for vertical movements
    .failOffsetX([-20, 20])   // Fail gesture if horizontal movement exceeds threshold
    .onUpdate((e) => {
      // Enhanced smooth translation with elastic effect
      const elasticFactor = Math.abs(e.translationY) > 300 ? 0.85 : 0.95;
      const dampedTranslation = e.translationY * elasticFactor;
      translateY.value = dampedTranslation;

      // Calculate progress with enhanced curves
      const progress = Math.min(Math.abs(dampedTranslation) / 800, 1);
      const direction = dampedTranslation < 0 ? -1 : 1;
      
      // Smooth rotation with progressive resistance
      const rotationFactor = Math.min(Math.abs(dampedTranslation) / 500, 1);
      rotate.value = interpolate(
        dampedTranslation,
        [-300, -150, 0, 150, 300],
        [-8 * rotationFactor, -4 * rotationFactor, 0, 4 * rotationFactor, 8 * rotationFactor]
      );

      // Enhanced scale animation with bounce effect
      const bounceProgress = Math.sin(progress * Math.PI);
      scale.value = interpolate(
        progress,
        [0, 0.3, 0.7, 1],
        [1, 0.97 + bounceProgress * 0.01, 0.95 + bounceProgress * 0.02, 0.93]
      );

      // Smooth opacity transition with delay
      opacity.value = interpolate(
        progress,
        [0, 0.2, 0.8, 1],
        [1, 0.95, 0.9, 0.85]
      );
    })
    .onEnd(({ velocityY }) => {
      const isSwipingFast = Math.abs(velocityY) > 800;
      const direction = velocityY < 0 ? 'up' : 'down';
      
      if ((translateY.value < -SWIPE_THRESHOLD) || (direction === 'up' && isSwipingFast)) {
        // Enhanced Swipe Up animation
        translateY.value = withSpring(-screenHeight * 1.2, {
          ...SPRING_CONFIG_FAST,
          velocity: velocityY * 1.2
        }, () => {
          runOnJS(onSwipeUp)();
          translateY.value = 0;
          rotate.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
        rotate.value = withSpring(-15, SPRING_CONFIG_FAST);
        scale.value = withSpring(0.85, SPRING_CONFIG_FAST);
        opacity.value = withSpring(0.5, SPRING_CONFIG_FAST);
      } else if ((translateY.value > SWIPE_THRESHOLD) || (direction === 'down' && isSwipingFast)) {
        // Enhanced Swipe Down animation
        translateY.value = withSpring(screenHeight * 1.2, {
          ...SPRING_CONFIG_FAST,
          velocity: velocityY * 1.2
        }, () => {
          runOnJS(onSwipeDown)();
          translateY.value = 0;
          rotate.value = 0;
          opacity.value = 1;
          scale.value = 1;
        });
        rotate.value = withSpring(15, SPRING_CONFIG_FAST);
        scale.value = withSpring(0.85, SPRING_CONFIG_FAST);
        opacity.value = withSpring(0.5, SPRING_CONFIG_FAST);
      } else {
        // Enhanced bounce-back animation
        const bounciness = Math.abs(velocityY) / 1000;
        translateY.value = withSpring(0, {
          ...SPRING_CONFIG_SNAP,
          velocity: velocityY,
          stiffness: 300 + bounciness * 100
        });
        rotate.value = withSpring(0, {
          ...SPRING_CONFIG_SNAP,
          stiffness: 300
        });
        scale.value = withSpring(1, {
          ...SPRING_CONFIG_SNAP,
          stiffness: 250
        });
        opacity.value = withSpring(1, SPRING_CONFIG_SNAP);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    // Apply consistent transform for all cards
    const transform = [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ];
    
    return {
      transform,
      opacity: opacity.value,
    };
  });

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
