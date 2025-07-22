import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface NewsCardProps {
  title: string;
  summary: string;
  why: string;
  upskill: string;
  sourceUrl?: string;
  image?: string;
}

export default function NewsCard({ title, summary, why, upskill, sourceUrl, image }: NewsCardProps) {
  return (
    <View style={styles.card}>
      {image && (
        <Image source={{ uri: image }} style={styles.headerImage} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>📌 Summary</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>💡 Why It Matters</Text>
          <Text style={styles.text}>{why}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>📈 How to Upskill</Text>
          <Text style={styles.text}>{upskill}</Text>
        </View>

        {sourceUrl && (
          <Pressable style={styles.button} onPress={() => Linking.openURL(sourceUrl)}>
            <Text style={styles.buttonText}>🔗 Learn More</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    width: width - 24,
    alignSelf: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 18,
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
