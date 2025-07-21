import { View, Text, StyleSheet, Image, Pressable, Linking } from 'react-native';

export default function NewsCard({ title, summary, why, how, video, image }: any) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.banner} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{summary}</Text>
      <Text style={styles.label}>Why It Matters:</Text>
      <Text style={styles.text}>{why}</Text>
      <Text style={styles.label}>How to Upskill from It:</Text>
      <Text style={styles.text}>{how}</Text>
      <Pressable onPress={() => Linking.openURL(video)}>
        <Text style={styles.link}>Watch on YouTube</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    marginTop: 4,
  },
  link: {
    color: 'blue',
    marginTop: 10,
  },
});
