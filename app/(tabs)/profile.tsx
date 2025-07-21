import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';

export default function ProfileScreen() {
  const [isTelugu, setIsTelugu] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>🌐 Language:</Text>
        <Switch value={isTelugu} onValueChange={setIsTelugu} />
        <Text>{isTelugu ? 'Telugu' : 'English'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>⚙️ App Settings (Coming Soon)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
});
