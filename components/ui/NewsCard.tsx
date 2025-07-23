import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

const { width, height: screenHeight } = Dimensions.get('window');
const extractYouTubeID = (url: string): string | null => {
  const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper to get responsive thumbnail width
const THUMBNAIL_HORIZONTAL_MARGIN = 40;
const THUMBNAIL_WIDTH = width - THUMBNAIL_HORIZONTAL_MARGIN;


interface NewsCardProps {
  title: string;
  summary: string;
  why: string;
  upskill: string;
  sourceUrl?: string;
  image?: string;
  youtube?: { url: string; title?: string };
  isSaved?: boolean;
  onToggleSave?: () => void;
  likeCount?: number;
  dislikeCount?: number;
  onLike?: () => void;
  onDislike?: () => void;
  style?: ViewStyle; // allow external styles (e.g., from SwipeableCard)
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
  style,
}: NewsCardProps) {
  const displaySummary = summary.length > 180 ? summary.substring(0, 180) + '...' : summary;
  

  return (
    <View style={[styles.card, style]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.headerImage} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.heading}>📌 Summary</Text>
          <Text style={styles.text}>{displaySummary}</Text>
        </View>

        {/* Why It Matters */}
        <View style={styles.section}>
          <Text style={styles.heading}>💡 Why It Matters</Text>
          <Text style={styles.text}>{why}</Text>
        </View>

        {/* How to Upskill */}
        <View style={styles.section}>
          <Text style={styles.heading}>📈 Key Takeaways</Text>
          <Text style={styles.text}>{upskill}</Text>
        </View>

        {/* YouTube */}
      {youtube?.url && (
       <Pressable
         style={styles.youtubeRow}
         onPress={() => Linking.openURL(youtube.url)}
         accessibilityRole="button"
         accessibilityLabel={youtube.title ? `Watch YouTube video: ${youtube.title}` : 'Watch YouTube video'}
       >
         <View style={styles.thumbnailButton}>
           <Image
             source={{
               uri: `https://img.youtube.com/vi/${extractYouTubeID(youtube.url)}/hqdefault.jpg`,
             }}
             style={styles.youtubeThumbnailSmall}
           />
           <View style={styles.playOverlay} pointerEvents="none">
             <MaterialIcons name="play-circle-fill" size={36} color="white" />
           </View>
         </View>
         <View style={styles.watchTextWrapper}>
           <Text style={styles.watchText}>▶ Watch This Video</Text>
           <Text style={styles.youtubeVideoTitle}>{youtube.title || ''}</Text>
         </View>
       </Pressable>
        )}
        {/* Action Row */}
        <View style={styles.actionRow}>
          {sourceUrl && (
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL(sourceUrl)}
            >
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

        {/* Like / Dislike */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
card: {
  backgroundColor: '#fff',
  borderRadius: 20,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 6,
  width: width,             // ✅ Full screen width
  height: screenHeight - 40, // ✅ Slight padding from bottom
  marginTop: 45,            // ✅ Space below notch
  alignSelf: 'center',
},


  headerImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  noImage: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  noImageText: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  titleLink: {
    color: '#007bff',
    // textDecorationLine: 'underline',
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
  likeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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
youtubeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
  marginBottom: 12,
},

thumbnailButton: {
  width: 100,
  height: 56,
  borderRadius: 8,
  overflow: 'hidden',
  position: 'relative',
  marginRight: 12,
},

youtubeThumbnailSmall: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},

playOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.2)',
},

watchTextWrapper: {
  flex: 1,
  justifyContent: 'center',
},

watchText: {
  fontSize: 13,
  fontWeight: 'bold',
  color: '#e74c3c',
  marginBottom: 4,
},

youtubeVideoTitle: {
  fontSize: 12,
  color: '#333',
  flexWrap: 'wrap',
},


});
