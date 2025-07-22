import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const [language, setLanguage] = useState('en');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>🌐 Language:</Text>
        <Picker
          selectedValue={language}
          onValueChange={setLanguage}
          mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Telugu" value="te" />
          <Picker.Item label="Tamil" value="ta" />
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>⚙️ App Settings (Coming Soon)</Text>
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
});
