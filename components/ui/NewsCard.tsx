import { View, Text, StyleSheet, Pressable, Linking, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function NewsCard({ title, summary, why, upskill, sourceUrl }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📰 {title}</Text>
      <Text style={styles.section}>📌 Summary: {summary}</Text>
      <Text style={styles.section}>💡 Why it matters: {why}</Text>
      <Text style={styles.section}>📈 How to upskill: {upskill}</Text>
      <Pressable onPress={() => Linking.openURL(sourceUrl)}>
        <Text style={styles.link}>🔗 Learn more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: '#1e90ff',
    fontWeight: 'bold',
    marginTop: 16,
  },
});
