// app/(tabs)/explore.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Explore Tech2News</Text>
      <Text style={styles.text}>
        Here you’ll discover trending tech updates, curated AI tools, tutorials, and much more!
      </Text>
      <Text style={styles.text}>
        Swipe through the home screen cards to get hourly updates on tools and innovations.
      </Text>
      <Text style={styles.text}>Coming Soon: Gemini AI, Firebase, Language toggle, and Admin mode!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
});
