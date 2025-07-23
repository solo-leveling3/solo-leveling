import { useAppContext } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const languages = [
  { code: 'en', label: 'English', icon: 'language' },
  { code: 'hi', label: 'Hindi (हिंदी)', icon: 'flag-outline' },
  { code: 'te', label: 'Telugu (తెలుగు)', icon: 'flag-outline' },
  { code: 'ta', label: 'Tamil (தமிழ்)', icon: 'flag-outline' },
];

export default function ProfileScreen() {
  const { language, setLanguage } = useAppContext();

  return (
    <LinearGradient
      colors={['#f3f4f8', '#e5ecf9']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🌐 Select Language</Text>

        <View style={styles.cardGrid}>
          {languages.map(({ code, label, icon }) => (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={[
                styles.languageCard,
                language === code && styles.activeCard
              ]}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={language === code ? '#fff' : '#007bff'}
              />
              <Text
                style={[
                  styles.languageLabel,
                  language === code && styles.activeLabel
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>⚙️ App Settings</Text>
          <Text style={styles.soonText}>Coming Soon...</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
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
    padding: 22,
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
    marginTop: 50,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  soonText: {
    fontSize: 15,
    color: '#007bff',
    backgroundColor: 'rgba(0,123,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '600',
  },
});
