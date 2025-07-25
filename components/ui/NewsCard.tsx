import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

function formatDate(timestamp: any, locale: string) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(locale, {
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
  const { t } = useTranslation();

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
        card: '#fff',
        section: '#f5f8ff',
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
            <Text style={[styles.noImageText, { color: colors.text }]}>{t('feed.noImage')}</Text>
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
              🕒 {formatDate(timestamp, language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'te-IN')}
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
              <Text style={[styles.heading, { color: colors.heading }]}>{t('feed.summary')}</Text>
              <Text style={[styles.text, { color: colors.text }]}>
                {displaySummary}
                {truncated && (
                  <Text style={[styles.readMoreText, { color: colors.readMore }]} onPress={onToggleSummary}>
                    {summaryExpanded ? t('feed.showLess') : t('feed.readMore')}
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
              <Text style={[styles.heading, { color: colors.heading }]}>{t('feed.whyMatters')}</Text>
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
              <Text style={[styles.heading, { color: colors.heading }]}>{t('feed.keyTakeaways')}</Text>
              {Array.isArray(upskill)
                ? upskill.map((point, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <MaterialIcons name="check-circle" size={16} color={colors.icon} style={{ marginRight: 6 }} />
                      <Text style={[styles.text, { flex: 1, color: colors.text }]}>{point}</Text>
                    </View>
                  ))
                : upskill.split(/\n|\.|•/).filter(Boolean).map((point, idx) => (
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
              <Image
                source={{ uri: `https://img.youtube.com/vi/${extractYouTubeID(youtube.url)}/hqdefault.jpg` }}
                style={styles.youtubeThumbnailSmall}
              />
              <View style={styles.playOverlay} pointerEvents="none">
                <MaterialIcons name="play-circle-fill" size={44} color="#fff" style={{ opacity: 0.95 }} />
              </View>
            </View>
            <View style={styles.watchTextWrapper}>
              <Text style={styles.watchText}>{t('feed.watchVideo')}</Text>
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
              <Text style={styles.buttonText}>{t('feed.readAiSummary')}</Text>
            </Pressable>
          </Animated.View>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[styles.saveButton, isSaved ? styles.saveButtonActive : styles.saveButtonInactive]}
            onPress={onToggleSave}
          >
            <MaterialIcons name={isSaved ? 'bookmark' : 'bookmark-border'} size={26} color={isSaved ? '#fff' : '#4c68ff'} />
            <Text style={[styles.saveText, isSaved ? { color: '#fff' } : { color: '#4c68ff' }]}>{t('feed.readLater')}</Text>
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
    marginTop: 28,
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e7ff',
  },
  headerWrapper: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop:0,
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
    padding: 12,
    paddingTop: 10,
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
    marginBottom: 8,
    borderRadius: 12,
  },
  sectionGradient: {
    borderRadius: 12,
    padding: 1.5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
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
    fontSize: 12,
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
    marginTop: 6,
    marginBottom: 6,
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
    marginTop: 1,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#4c68ff',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnailButton: {
    width: 100,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  youtubeThumbnailSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76,104,255,0.13)',
  },
  watchTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  watchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4c68ff',
    marginBottom: 4,
  },

});
