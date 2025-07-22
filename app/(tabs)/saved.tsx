import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.icon}>🔖</Text>
        <Text style={styles.title}>Saved News</Text>
        <Text style={styles.text}>Your bookmarked news will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  icon: {
    fontSize: 48,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
