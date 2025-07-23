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
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = summary.length > 180;
  const displaySummary = shouldTruncate && !isExpanded
    ? summary.substring(0, 180) + '...'
    : summary;

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={{ uri: image }} style={styles.headerImage} />
      ) : (
        <View style={styles.noImage}><Text style={styles.noImageText}>No Image</Text></View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {/* Summary Section */}
        <Pressable style={styles.section} onPress={() => shouldTruncate && setIsExpanded(!isExpanded)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>📌 Summary</Text>
            {shouldTruncate && (
              <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={20} color="#007bff" />
            )}
          </View>
          <Text style={styles.text}>{displaySummary}</Text>
          {shouldTruncate && (
            <Text style={styles.expandText}>
              {isExpanded ? 'Tap to collapse' : 'Tap to read more'}
            </Text>
          )}
        </Pressable>

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

        {/* Actions */}
        <View style={styles.buttonRow}>
          {sourceUrl && (
            <Pressable style={styles.button} onPress={() => Linking.openURL(sourceUrl)}>
              <Text style={styles.buttonText}>🔗 Read This Article</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable style={styles.saveButton} onPress={onToggleSave}>
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
          <Pressable style={styles.iconButton} onPress={onLike}>
            <MaterialIcons name="thumb-up" size={16} color="#007bff" />
            <Text style={styles.countText}>{likeCount}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onDislike}>
            <MaterialIcons name="thumb-down" size={16} color="#e74c3c" />
            <Text style={styles.countText}>{dislikeCount}</Text>
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
  },
  headerImage: {
    width: '100%',
    height: 200,
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
    color: '#111',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  expandText: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
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
});
