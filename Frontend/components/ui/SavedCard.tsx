import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface SavedCardProps {
  title: string;
  summary: string;
  image?: string;
  savedAt: number;
  onRemove: () => void;
  onPress?: () => void;
  theme: 'light' | 'dark';
}

export default function SavedCard({ title, summary, image, savedAt, onRemove, onPress, theme }: SavedCardProps) {
  const date = new Date(savedAt);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const colors = theme === 'dark'
    ? {
        card: '#23262f',
        border: '#a084ee',
        text: '#f3f4f8',
        summary: '#aaa',
        date: '#a084ee',
        removeBtn: '#353945',
        removeBtnText: '#a084ee',
        thumbnail: '#23262f',
      }
    : {
        card: '#fff',
        border: '#a084ee',
        text: '#1c1c40',
        summary: '#555',
        date: '#a084ee',
        removeBtn: '#f3f4f8',
        removeBtnText: '#a084ee',
        thumbnail: '#f3f4f8',
      };
  return (
    <Pressable style={[styles.card, { backgroundColor: colors.card, borderLeftColor: colors.border }]} onPress={onPress} android_ripple={{ color: theme === 'dark' ? '#353945' : '#f3f4f8' }}>
      {image ? (
        <Image source={{ uri: image }} style={[styles.thumbnail, { backgroundColor: colors.thumbnail }]} />
      ) : (
        <View style={[styles.noImage, { backgroundColor: colors.thumbnail }]}><Text style={styles.noImageText}>📰</Text></View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.summary, { color: colors.summary }]} numberOfLines={3}>{summary}</Text>
        <View style={styles.footer}>
          <Text style={[styles.date, { color: colors.date }]}>Saved: {formattedDate}</Text>
          <Pressable onPress={onRemove} style={[styles.removeBtn, { backgroundColor: colors.removeBtn }]} android_ripple={{ color: theme === 'dark' ? '#353945' : '#e0e7ff' }}>
            <Text style={[styles.removeBtnText, { color: colors.removeBtnText }]}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#4c68ff',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#a084ee',
    alignItems: 'center',
    padding: 10,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#f3f4f8',
  },
  noImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#f3f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 24,
    color: '#a084ee',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1c1c40',
  },
  summary: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    color: '#a084ee',
  },
  removeBtn: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3f4f8',
    borderRadius: 8,
  },
  removeBtnText: {
    color: '#a084ee',
    fontWeight: '700',
    fontSize: 13,
  },
}); 