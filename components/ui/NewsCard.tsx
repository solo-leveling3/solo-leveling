import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface NewsCardProps {
  title: string;
  summary: string;
  why: string;
  upskill: string;
  sourceUrl?: string;
  image?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  likeCount?: number;
  dislikeCount?: number;
  onLike?: () => void;
  onDislike?: () => void;
}

export default function NewsCard({
  title,
  summary,
  why,
  upskill,
  sourceUrl,
  image,
  isSaved,
  onToggleSave,
  likeCount = 0,
  dislikeCount = 0,
  onLike,
  onDislike,
}: NewsCardProps) {
  return (
    <View style={styles.card}>
      {image && <Image source={{ uri: image }} style={styles.headerImage} />}
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

        <View style={styles.buttonRow}>
          {sourceUrl && (
            <Pressable style={styles.button} onPress={() => Linking.openURL(sourceUrl)}>
              <Text style={styles.buttonText}>🔗 Learn More</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={16}>
            <MaterialIcons
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={28}
              color={isSaved ? '#007bff' : '#888'}
            />
            <Text style={[styles.buttonText, { color: isSaved ? '#007bff' : '#888', marginLeft: 4 }]}>Save</Text>
          </Pressable>
        </View>
        <View style={styles.likeRow}>
          <Pressable style={styles.iconButtonTiny} onPress={onLike} hitSlop={6}>
            <MaterialIcons name="thumb-up" size={16} color="#007bff" />
            <Text style={styles.countTextTiny}>{likeCount}</Text>
          </Pressable>
          <Pressable style={styles.iconButtonTiny} onPress={onDislike} hitSlop={6}>
            <MaterialIcons name="thumb-down" size={16} color="#e74c3c" />
            <Text style={styles.countTextTiny}>{dislikeCount}</Text>
          </Pressable>
        </View>
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 16,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 0,
  },
  countText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 6,
    minWidth: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    flexDirection: 'row',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 0,
  },
  countTextSmall: {
    fontSize: 13,
    color: '#222',
    marginLeft: 4,
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  iconButtonMedium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 0,
  },
  countTextMedium: {
    fontSize: 15,
    color: '#222',
    marginLeft: 5,
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  iconButtonTiny: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f6ff',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 0,
  },
  countTextTiny: {
    fontSize: 11,
    color: '#222',
    marginLeft: 2,
    minWidth: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
});
