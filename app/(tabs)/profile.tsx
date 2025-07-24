import { useAppContext } from '@/contexts/AppContext';
import { useLanguageStrings } from '@/hooks/useLanguageStrings';
import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { language, setLanguage } = useAppContext();
  const strings = useLanguageStrings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.profile.title}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{strings.profile.languageLabel}</Text>
        <Text style={styles.description}>
          {strings.profile.languageDescription}
        </Text>
        <Picker
          selectedValue={language}
          onValueChange={setLanguage}
          mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
          style={styles.picker}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Hindi (हिंदी)" value="hi" />
          <Picker.Item label="Telugu (తెలుగు)" value="te" />
          <Picker.Item label="Tamil (தமிழ்)" value="ta" />
        </Picker>
        <Text style={styles.currentSelection}>
          {strings.profile.currentSelection} {language === 'en' ? 'English' : language === 'hi' ? 'Hindi (हिंदी)' : language === 'te' ? 'Telugu (తెలుగు)' : 'Tamil (தமிழ்)'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{strings.profile.appSettings}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  picker: {
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  currentSelection: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
    textAlign: 'center',
  },
});
