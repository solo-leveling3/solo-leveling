import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import NewsCard from './ui/NewsCard';
const { height } = Dimensions.get('window');

export default function SwipeableCard({ card, onSwipeUp, onSwipeDown }) {
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      if (translateY.value < -150) {
        runOnJS(onSwipeUp)();
      } else if (translateY.value > 150) {
        runOnJS(onSwipeDown)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, rStyle]}>
        <NewsCard {...card} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    height,
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff',
  },
});
