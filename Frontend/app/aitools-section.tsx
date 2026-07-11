import { aiTools } from '@/constants/aiTools';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AiToolsSection() {
  return (
    <LinearGradient colors={['#f3f4f8', '#e5ecf9']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🚀 All Popular AI Tools</Text>
        <View style={styles.toolsGrid}>
          {aiTools.map((tool, index) => (
            <Pressable
              key={index}
              style={styles.toolCard}
              onPress={() => Linking.openURL(tool.url)}
            >
              <Ionicons name={tool.icon as any} size={28} color="#007bff" />
              <Text style={styles.toolName}>{tool.name}</Text>
            </Pressable>
          ))}
        </View>
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
    paddingTop: 64,
    paddingBottom: 40,
  },
  // backButton and backText styles removed
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1c1c40',
    letterSpacing: 0.5,
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
    marginBottom: 10,
  },
  toolName: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c40',
    textAlign: 'center',
  },
}); 