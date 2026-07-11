import { useAppContext } from '@/contexts/AppContext';
import { translateText } from '@/lib/translate';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleProp, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

export default function AISummaryScreen() {
  const { title, content, image } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { language } = useAppContext();
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lessonText = typeof content === 'string' ? content : '';

  useEffect(() => {
    let isMounted = true;
    async function doTranslate() {
      setLoading(true);
      try {
        if (language === 'en') {
          setTranslatedContent(lessonText);
        } else {
          const translated = await translateText(lessonText, language);
          if (isMounted) setTranslatedContent(translated);
        }
      } catch (e) {
        setTranslatedContent(lessonText);
      } finally {
        setLoading(false);
      }
    }
    doTranslate();
    return () => { isMounted = false; };
  }, [lessonText, language]);

  const formattedContent = (translatedContent || lessonText)
    .split(/(?=📘|📚|✅|\n\d+\.\s)/g)
    .map((section, idx) => {
      const emoji = section.trim().slice(0, 2);
      const isDark = colorScheme === 'dark';
      let sectionStyle: StyleProp<ViewStyle> = styles.sectionWrapper;
      let textStyle: StyleProp<TextStyle> = styles.sectionText;
      if (emoji === '📘') {
        sectionStyle = [styles.sectionWrapper, styles.blueBox, ...(isDark ? [styles.blueBoxDark] : [])];
        textStyle = [styles.sectionText, styles.blueText, ...(isDark ? [styles.blueTextDark] : [])];
      } else if (emoji === '📚') {
        sectionStyle = [styles.sectionWrapper, styles.greenBox, ...(isDark ? [styles.greenBoxDark] : [])];
        textStyle = [styles.sectionText, styles.greenText, ...(isDark ? [styles.greenTextDark] : [])];
      } else if (emoji === '✅') {
        sectionStyle = [styles.sectionWrapper, styles.purpleBox, ...(isDark ? [styles.purpleBoxDark] : [])];
        textStyle = [styles.sectionText, styles.purpleText, ...(isDark ? [styles.purpleTextDark] : [])];
      } else {
        sectionStyle = [styles.sectionWrapper, ...(isDark ? [styles.sectionWrapperDark] : [])];
        textStyle = [styles.sectionText, ...(isDark ? [{ color: '#e3e8ff' }] : [])];
      }
      return (
        <View key={idx} style={sectionStyle}>
          <Text style={textStyle}>{section.trim()}</Text>
        </View>
      );
    });

  return (
    <ScrollView
      style={[
        styles.container,
        colorScheme === 'dark' && { backgroundColor: '#121214' },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {typeof image === 'string' && image.length > 0 && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {colorScheme === 'dark' && (
            <View style={styles.imageDarkOverlay} />
          )}
        </View>
      )}
      <Text style={[styles.title, colorScheme === 'dark' && { color: '#fefefe' }]}> 
        Ai Summary
      </Text>
      {loading ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#a084ee', fontSize: 16 }}>Translating...</Text>
        </View>
      ) : (
        <View style={styles.content}>{formattedContent}</View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    backgroundColor: '#f8f9ff',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  image: {
    width: width - 36,
    height: 200,
    borderRadius: 16,
    alignSelf: 'center',
  },
  imageDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1c1c40',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    paddingHorizontal: 10,
  },
  content: {
    paddingBottom: 40,
  },
  sectionWrapper: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionWrapperDark: {
    backgroundColor: '#1E1E24',
    borderColor: '#2F3036',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionText: {
    fontSize: 16.5,
    lineHeight: 26,
    color: '#2a2a3a',
    letterSpacing: 0.3,
  },
  blueBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    backgroundColor: '#eaf4fc',
    shadowColor: '#3498db',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  blueText: {
    color: '#1c3f78',
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: 16.5,
  },
  blueBoxDark: {
    backgroundColor: '#1C2333',
    borderLeftColor: '#64b5f6',
    shadowColor: '#64b5f6',
    borderLeftWidth: 6,
  },
  blueTextDark: {
    color: '#ADD6FF',
    textShadowColor: 'rgba(100,181,246,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  greenBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
    backgroundColor: '#e6f5ec',
    shadowColor: '#27ae60',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  greenText: {
    color: '#185f3f',
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: 16.5,
  },
  greenBoxDark: {
    backgroundColor: '#1C2826',
    borderLeftColor: '#58d68d',
    shadowColor: '#58d68d',
    borderLeftWidth: 6,
  },
  greenTextDark: {
    color: '#9DEBB3',
    textShadowColor: 'rgba(88,214,141,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  purpleBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
    backgroundColor: '#f5e8fa',
    shadowColor: '#8e44ad',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  purpleText: {
    color: '#4c2375',
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: 16.5,
  },
  purpleBoxDark: {
    backgroundColor: '#1F1A24',
    borderLeftColor: '#bb8fce',
    shadowColor: '#bb8fce',
    borderLeftWidth: 6,
  },
  purpleTextDark: {
    color: '#E2C6F1',
    textShadowColor: 'rgba(187,143,206,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c40',
    letterSpacing: 0.2,
  },
});
