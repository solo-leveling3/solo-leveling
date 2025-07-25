import { useAppContext } from '@/contexts/AppContext';
import { translateText } from '@/lib/translate';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width, height: screenHeight } = Dimensions.get('window');
const THUMBNAIL_HORIZONTAL_MARGIN = 40;
const THUMBNAIL_WIDTH = width - THUMBNAIL_HORIZONTAL_MARGIN;

const extractYouTubeID = (url: string): string | null => {
  const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

function formatDate(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
  timestamp?: any;
  style?: ViewStyle;
  summaryExpanded?: boolean;
  onToggleSummary?: () => void;
  lessonContent?: string;
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
  timestamp,
  style,
  summaryExpanded = false,
  onToggleSummary,
  lessonContent,
}: NewsCardProps) {
  const router = useRouter();
  const { theme, language } = useAppContext();
  const [translatedHeadings, setTranslatedHeadings] = useState({
    summary: 'Summary',
    why: 'Why it Matters',
    takeaways: 'Key Takeaways',
  });
  const [translatedUpskill, setTranslatedUpskill] = useState<string | string[]>(upskill);

useEffect(() => {
  let isMounted = true;

  async function doTranslate() {
    if (language === 'en') {
      setTranslatedHeadings({
        summary: 'Summary',
        why: 'Why it Matters',
        takeaways: 'Key Takeaways',
      });
      setTranslatedUpskill(upskill);
    } else {
      try {
        const [summary, why, takeaways] = await Promise.all([
          translateText('Summary', language),
          translateText('Why it Matters', language),
          translateText('Key Takeaways', language),
        ]);

        const bulletPoints = upskill.split(/\n|•|\.|-/).filter(Boolean);

        const translatedPoints = await Promise.all(
          bulletPoints.map((point) =>
            translateText(point.trim(), language)
          )
        );

        if (isMounted) {
          setTranslatedHeadings({ summary, why, takeaways });
          setTranslatedUpskill(translatedPoints as string[]);
        }
      } catch (error) {
        console.error('Translation failed:', error);
        if (isMounted) {
          setTranslatedUpskill(upskill); // fallback to English
        }
      }
    }
  }

  doTranslate();

  return () => {
    isMounted = false;
  };
}, [language, upskill]);


  // Theme-aware colors
  const colors = theme === 'dark'
    ? {
        card: '#23262f',
        section: '#181a20',
        border: '#353945',
        text: '#f3f4f8',
        heading: '#a084ee', // accent for dark
        gradient: ['#23262f', '#181a20'] as [string, string],
        icon: '#a084ee',
        readMore: '#a084ee',
        title: '#c4fca4',
      }
    : {
        card: '#f5f8ff', // changed from #fff to a modern card shade
        section: '#fff',
        border: '#e0e7ff',
        text: '#222b45',
        heading: '#1c1c40', // dark for light mode
        gradient: ['#4c68ff', '#a084ee'] as [string, string],
        icon: '#4c68ff',
        readMore: '#4c68ff',
        title: '#e6ed13',
      };

  const truncated = summary.length > 180;
  const displaySummary = summaryExpanded || !truncated ? summary : summary.substring(0, 180) + '...';

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.card, style, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerWrapper}>
        {image ? (
          <Pressable
            onPressIn={() => (scale.value = withSpring(0.97))}
            onPressOut={() => (scale.value = withSpring(1))}
            style={{ borderRadius: 20, overflow: 'hidden' }}
          >
            <Image source={{ uri: image }} style={styles.headerImage} />
            <LinearGradient
              colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.0)"]}
              style={styles.headerGradient}
            />
          </Pressable>
        ) : (
          <View style={styles.noImage}>
            <Text style={[styles.noImageText, { color: colors.text }]}>No Image</Text>
          </View>
        )}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => sourceUrl && sourceUrl.startsWith('http') && Linking.openURL(sourceUrl)}>
          <Text style={[styles.title, { color: colors.title }]} numberOfLines={2} ellipsizeMode="tail">

            {title}
          </Text>
        </Pressable>
        {timestamp && (
          <View style={[styles.timestampBadge, { backgroundColor: colors.section }]}>
            <Text style={[styles.timestampText, { color: colors.heading }]}>
              🕒 {formatDate(timestamp)}
            </Text>
          </View>
        )}
        {/* Section: Summary */}
        <View style={styles.sectionGradientWrapper}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <View style={[styles.sectionCard, { backgroundColor: colors.section, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.heading }]}>📌 {translatedHeadings.summary}</Text>
              <Text style={[styles.text, { color: colors.text }]}>
                {displaySummary}
                {truncated && (
                  <Text style={[styles.readMoreText, { color: colors.readMore }]} onPress={onToggleSummary}>
                    {summaryExpanded ? ' Show less' : 'Read more'}
                  </Text>
                )}
              </Text>
            </View>
          </LinearGradient>
        </View>
        {/* Section: Why It Matters */}
        <View style={styles.sectionGradientWrapper}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <View style={[styles.sectionCard, { backgroundColor: colors.section, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.heading }]}>💡 {translatedHeadings.why}</Text>
              <Text style={[styles.text, { color: colors.text }]}>{why}</Text>
            </View>
          </LinearGradient>
        </View>
        {/* Section: Key Takeaways */}
        <View style={styles.sectionGradientWrapper}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionGradient}
          >
            <View style={[styles.sectionCard, { backgroundColor: colors.section, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.heading }]}>📈 {translatedHeadings.takeaways}</Text>
              {Array.isArray(translatedUpskill)
                ? translatedUpskill.map((point, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <MaterialIcons name="check-circle" size={16} color={colors.icon} style={{ marginRight: 6 }} />
                      <Text style={[styles.text, { flex: 1, color: colors.text }]}>{point}</Text>
                    </View>
                  ))
                : translatedUpskill.split(/\n|\.|•/).filter(Boolean).map((point, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <MaterialIcons name="check-circle" size={16} color={colors.icon} style={{ marginRight: 6 }} />
                      <Text style={[styles.text, { flex: 1, color: colors.text }]}>{point.trim()}</Text>
                    </View>
                  ))}
            </View>
          </LinearGradient>
        </View>
        {youtube?.url && (
          <Pressable
            style={styles.youtubeRow}
            onPress={() => Linking.openURL(youtube.url)}
            accessibilityRole="button"
            accessibilityLabel={youtube.title ? `Watch YouTube video: ${youtube.title}` : 'Watch YouTube video'}
          >
            <View style={styles.thumbnailButton}>
              <View style={styles.youtubeLogo}>
                <View style={styles.youtubePlayButton}>
                  <View style={styles.playTriangle} />
                </View>
              </View>
            </View>
            <View style={styles.watchTextWrapper}>
              <Text style={styles.watchText}>Watch AI Recommended Video</Text>
              <Text style={styles.youtubeSubtext}>on YouTube</Text>
            </View>
          </Pressable>
        )}
        <View style={styles.actionRow}>
          <Animated.View style={[styles.animatedWrapper, animatedStyle]}>
            <Pressable
              style={styles.animatedButton}
              onPressIn={() => (scale.value = withSpring(0.95))}
              onPressOut={() => (scale.value = withSpring(1))}
              onPress={() =>
                router.push({
                  pathname: '/lesson-details',
                  params: {
                    id: title,
                    content: lessonContent ?? '',
                    image,
                  },
                })
              }
            >
              <Text style={styles.buttonText}>✨ Read AI Summary</Text>
            </Pressable>
          </Animated.View>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[styles.saveButton, isSaved ? styles.saveButtonActive : styles.saveButtonInactive]}
            onPress={onToggleSave}
          >
            <MaterialIcons name={isSaved ? 'bookmark' : 'bookmark-border'} size={26} color={isSaved ? '#fff' : '#4c68ff'} />
            <Text style={[styles.saveText, isSaved ? { color: '#fff' } : { color: '#4c68ff' }]}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
    width: width,
    height: screenHeight - 80,
    marginTop: 16, // reduced from 28
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e7ff',
  },
headerWrapper: {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: 'hidden',
  marginTop: 38, // move image slightly down
  marginHorizontal: 5, // add space on left & right
  marginBottom: 2, // reduce space below image
},
headerImage: {
  width: '100%',
  height: 110,
  resizeMode: 'cover',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
headerGradient: {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: 110,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},

  noImage: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  noImageText: {
    color: '#b0b0b0',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 10,
    paddingTop: 12, // was 28
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(76,104,255,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleLink: {
    color: '#4c68ff',
  },
  timestampBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
    marginTop: 2,
  },
  timestampText: {
    fontSize: 10.5,
    color: '#4c68ff',
    fontWeight: '600',
  },
  sectionGradientWrapper: {
    marginBottom: 1.5, // was 4
    borderRadius: 12,
  },
  sectionGradient: {
    borderRadius: 12,
    padding: 1, // reduced from 1.5
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 7, // reduced from 10
    minHeight: 32, // reduced from 40
    shadowColor: '#4c68ff',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  heading: {
    fontSize: 13, // ↓ for better compaction
    fontWeight: '700',
    color: '#4c68ff',
    marginBottom: 4, // ↓ tighter section
    letterSpacing: 0.15,
  },
  text: {
    fontSize: 13,
    color: '#222b45',
    lineHeight: 20, // ↓ slightly reduced line height
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: 11.5, // ↓ slightly smaller
    fontWeight: '600',
    color: '#4c68ff',
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2, // reduced from 6
    marginBottom: 2, // reduced from 6
  },
  animatedWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4c68ff',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  animatedButton: {
    backgroundColor: '#4c68ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4c68ff',
    marginLeft: 8,
  },
  saveButtonActive: {
    backgroundColor: '#4c68ff',
    borderColor: '#4c68ff',
  },
  saveButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#4c68ff',
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
  },
youtubeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f5f8ff', // modern card shade
  padding: 1,
  borderRadius: 14,
  marginTop: 7,
  marginBottom: 6.5,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
  borderWidth: 1,
  borderColor: '#e0e7ff',
},

thumbnailButton: {
  width: 70,
  height: 42,
  borderRadius: 12,
  overflow: 'hidden',
  marginRight: 12,
  position: 'relative',
  backgroundColor: '#FF0000', // YouTube red
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 2, // add space on left
},

youtubeLogo: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FF0000',
},

youtubePlayButton: {
  width: 28,
  height: 20,
  backgroundColor: 'white',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
},

playTriangle: {
  width: 0,
  height: 0,
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderLeftWidth: 8,
  borderRightWidth: 8,
  borderBottomWidth: 12,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderBottomColor: '#FF0000',
  transform: [{ rotate: '90deg' }],
  marginLeft: 2,
},

watchTextWrapper: {
  flex: 1,
  justifyContent: 'center',
},

watchText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#4c68ff',
  letterSpacing: 0.3,
  marginBottom: 2,
},

youtubeSubtext: {
  fontSize: 12,
  color: '#666',
  letterSpacing: 0.2,
  fontWeight: '500',
},
});
