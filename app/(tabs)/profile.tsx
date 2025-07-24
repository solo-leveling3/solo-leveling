import { useAppContext } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const languages = [
  { code: 'en', label: 'English', icon: 'language' },
  { code: 'hi', label: 'Hindi (हिंदी)', icon: 'flag-outline' },
  { code: 'te', label: 'Telugu (తెలుగు)', icon: 'flag-outline' },
];

export default function ProfileScreen() {
  const { language, setLanguage } = useAppContext();

  return (
    <LinearGradient colors={['#f3f4f8', '#e5ecf9']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🌐 Select Language</Text>

        <View style={styles.cardGrid}>
          {languages.map(({ code, label, icon }) => (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={[styles.languageCard, language === code && styles.activeCard]}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={language === code ? '#fff' : '#007bff'}
              />
              <Text style={[styles.languageLabel, language === code && styles.activeLabel]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>⚙️ App Settings</Text>
          <Text style={styles.soonText}>More coming soon...</Text>
        </View>

        <Pressable onPress={() => router.push('/aitools-section')} style={styles.aiButton}>
          <Ionicons name="rocket-outline" size={20} color="#fff" />
          <Text style={styles.aiButtonText}>Explore AI Tools</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1c1c40',
    letterSpacing: 0.5,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginBottom: 20,
  },
  languageCard: {
    width: '48%',
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderColor: '#e0e7ff',
    borderWidth: 1,
  },
  activeCard: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
    shadowColor: '#007bff',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  languageLabel: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#007bff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#fff',
  },
  section: {
    marginTop: 40,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  soonText: {
    fontSize: 15,
    color: '#007bff',
    backgroundColor: 'rgba(0,123,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginBottom: 30,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#007bff',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  toolName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c40',
    textAlign: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop:25,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',

  },
});
