import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface NewsCardProps {
  title: string;
  summary: string;
  why: string;
  upskill: string;
  sourceUrl?: string;
  image?: string;
  youtube?: { url: string; title?: string }; // ✅ Now treated as object
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
  youtube,
  sourceUrl,
  image,
  isSaved,
  onToggleSave,
  likeCount = 0,
  dislikeCount = 0,
  onLike,
  onDislike,
}: NewsCardProps) {
  const displaySummary = summary.length > 180 ? summary.substring(0, 180) + '...' : summary;

  // Local state for like/dislike
  const [localLike, setLocalLike] = useState(false);
  const [localDislike, setLocalDislike] = useState(false);
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);

  const handleLike = () => {
    if (!localLike) {
      setLikes(likes + 1);
      setLocalLike(true);
      if (localDislike) {
        setDislikes(dislikes - 1);
        setLocalDislike(false);
      }
      onLike?.();
    } else {
      setLikes(likes - 1);
      setLocalLike(false);
    }
  };

  const handleDislike = () => {
    if (!localDislike) {
      setDislikes(dislikes + 1);
      setLocalDislike(true);
      if (localLike) {
        setLikes(likes - 1);
        setLocalLike(false);
      }
      onDislike?.();
    } else {
      setDislikes(dislikes - 1);
      setLocalDislike(false);
    }
  };

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={{ uri: image }} style={styles.headerImage} />
      ) : (
        <View style={styles.noImage}><Text style={styles.noImageText}>No Image</Text></View>
      )}

      <View style={styles.content}>
        {/* Clickable Title */}
        <Pressable
          onPress={() => {
            if (typeof sourceUrl === 'string' && sourceUrl.startsWith('http')) {
              Linking.openURL(sourceUrl);
            }
          }}
        >
          <Text style={[styles.title, styles.titleLink]}>{title}</Text>
        </Pressable>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.heading}>📌 Summary</Text>
          <Text style={styles.text}>{displaySummary}</Text>
        </View>

        {/* Why It Matters */}
        <View style={styles.section}>
          <Text style={styles.heading}>💡 Why It Matters</Text>
          <Text style={styles.text}>{why || 'No insight available yet.'}</Text>
        </View>

        {/* How to Upskill */}
        <View style={styles.section}>
          <Text style={styles.heading}>📈 How to Upskill</Text>
          <Text style={styles.text}>{upskill || 'No upskill advice yet.'}</Text>
        </View>

        {/* YouTube Button (smaller, above action row) */}
        {youtube?.url && (
          <View style={styles.youtubeWrapperSmall}>
            <Pressable
              style={styles.youtubeButtonSmall}
              onPress={() => {
                if (typeof youtube.url === 'string' && youtube.url.startsWith('http')) {
                  Linking.openURL(youtube.url);
                }
              }}
            >
              <Text style={styles.youtubeButtonTextSmall}>▶ {youtube.title || 'Watch Video'}</Text>
            </Pressable>
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          {sourceUrl && (
            <Pressable
              style={styles.button}
              onPress={() => {
                if (typeof sourceUrl === 'string' && sourceUrl.startsWith('http')) {
                  Linking.openURL(sourceUrl);
                }
              }}
            >
              <Text style={styles.buttonText}>🔗 Read This Article</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable style={styles.saveButton} onPress={() => onToggleSave?.()}>
            <MaterialIcons
              name={isSaved ? 'bookmark' : 'bookmark-border'}
              size={26}
              color={isSaved ? '#007bff' : '#aaa'}
            />
            <Text style={[styles.saveText, { color: isSaved ? '#007bff' : '#888' }]}>Save</Text>
          </Pressable>
        </View>

        {/* Like/Dislike */}
        <View style={styles.likeRow}>
          <Pressable style={styles.iconButton} onPress={handleLike}>
            <MaterialIcons name="thumb-up" size={16} color={localLike ? '#007bff' : '#aaa'} />
            <Text style={styles.countText}>{likes}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleDislike}>
            <MaterialIcons name="thumb-down" size={16} color={localDislike ? '#e74c3c' : '#aaa'} />
            <Text style={styles.countText}>{dislikes}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    margin: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    width: width - 24,
    alignSelf: 'center',
    maxHeight: 680,
  },
  headerImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  noImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  noImageText: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  titleLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    color: '#444',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  youtubeButton: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  youtubeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  likeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  youtubeWrapperSmall: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  youtubeButtonSmall: {
    backgroundColor: '#ff0000',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  youtubeButtonTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
