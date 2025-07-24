import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

export default function LessonDetailsScreen() {
  const { title, content, image } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const lessonText = typeof content === 'string' ? content : '';

  const formattedContent = lessonText
    .split(/(?=📘|📚|✅|\n\d+\.\s)/g)
    .map((section, idx) => {
      const emoji = section.trim().slice(0, 2);
      const isDark = colorScheme === 'dark';

      let sectionStyle: StyleProp<ViewStyle> = styles.sectionWrapper;
      let textStyle: StyleProp<TextStyle> = styles.sectionText;

      if (emoji === '📘') {
        sectionStyle = [
          styles.sectionWrapper,
          styles.blueBox,
          ...(isDark ? [styles.blueBoxDark] : [])
        ];
        textStyle = [
          styles.sectionText,
          styles.blueText,
          ...(isDark ? [styles.blueTextDark] : [])
        ];
      } else if (emoji === '📚') {
        sectionStyle = [
          styles.sectionWrapper,
          styles.greenBox,
          ...(isDark ? [styles.greenBoxDark] : [])
        ];
        textStyle = [
          styles.sectionText,
          styles.greenText,
          ...(isDark ? [styles.greenTextDark] : [])
        ];
      } else if (emoji === '✅') {
        sectionStyle = [
          styles.sectionWrapper,
          styles.purpleBox,
          ...(isDark ? [styles.purpleBoxDark] : [])
        ];
        textStyle = [
          styles.sectionText,
          styles.purpleText,
          ...(isDark ? [styles.purpleTextDark] : [])
        ];
      } else {
        sectionStyle = [
          styles.sectionWrapper,
          ...(isDark ? [styles.sectionWrapperDark] : [])
        ];
        textStyle = [
          styles.sectionText,
          ...(isDark ? [{ color: '#e3e8ff' }] : [])
        ];
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
        colorScheme === 'dark' && { backgroundColor: '#0e0e0e' },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={colorScheme === 'dark' ? '#e3e8ff' : '#1c1c40'}
          style={{ marginRight: 4 }}
        />
        <Text style={[
          styles.backButtonText,
          colorScheme === 'dark' && { color: '#e3e8ff' },
        ]}>Back</Text>
      </Pressable>
      {typeof image === 'string' && image.length > 0 && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
      <Text style={[styles.title, colorScheme === 'dark' && { color: '#fefefe' }]}>
        {title}
      </Text>
      <View style={styles.content}>{formattedContent}</View>
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
  image: {
    width: width - 36,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1c1c40',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    paddingBottom: 40,
  },
  sectionWrapper: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionWrapperDark: {
    backgroundColor: '#181a20',
    borderColor: '#23242a',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },

  // 🎨 Blue Section (📘 Intro)
  blueBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    backgroundColor: '#eaf4fc',
  },
  blueText: {
    color: '#1c3f78',
    fontWeight: '600',
  },
  blueBoxDark: {
    backgroundColor: '#203a4f',
    borderLeftColor: '#64b5f6',
  },
  blueTextDark: {
    color: '#d1ecff',
  },

  // 🎨 Green Section (📚 Lesson)
  greenBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
    backgroundColor: '#e6f5ec',
  },
  greenText: {
    color: '#185f3f',
    fontWeight: '600',
  },
  greenBoxDark: {
    backgroundColor: '#1d4030',
    borderLeftColor: '#58d68d',
  },
  greenTextDark: {
    color: '#c6f7d4',
  },

  // 🎨 Purple Section (✅ Takeaways)
  purpleBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
    backgroundColor: '#f5e8fa',
  },
  purpleText: {
    color: '#4c2375',
    fontWeight: '600',
  },
  purpleBoxDark: {
    backgroundColor: '#2e1f3b',
    borderLeftColor: '#bb8fce',
  },
  purpleTextDark: {
    color: '#f0e0ff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c40',
  },
});
