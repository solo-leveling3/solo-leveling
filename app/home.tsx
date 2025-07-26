import { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const scale = useSharedValue(1.5); // Initial scale for zoom out effect

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/feed');
    }, 2000); // 2 seconds

    // Start zoom out animation
    scale.value = withTiming(1, { duration: 1000 });

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/logo.png')}
        style={[styles.logo, animatedStyle]}
        entering={FadeInDown.duration(1000)}
      />
      <Animated.Text style={styles.title} entering={FadeInDown.delay(300).duration(1000)}>
        TechNx
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});