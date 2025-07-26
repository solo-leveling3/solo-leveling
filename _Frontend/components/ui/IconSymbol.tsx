// Fallback for using MaterialIcons on Android and web.

import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Custom for tab bar:
  'list.bullet': 'dynamic-feed', // Feed
  'bookmark.fill': 'bookmark',   // Saved
  'person.crop.circle': 'person', // Profile
} as IconMapping;

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  weight?: any;
  modern?: boolean;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 28,
  color,
  style = undefined,
  weight = undefined,
  modern = false,
  onPressIn = undefined,
  onPressOut = undefined,
}: IconSymbolProps) {
  // Always use Ionicons for tab bar icons
  const ioniconMap: Record<string, any> = {
    'list.bullet': 'newspaper-outline',
    'bookmark.fill': 'bookmark-outline',
    'person.crop.circle': 'person-circle-outline',
  };
  const ioniconName: any = ioniconMap[name] || 'ellipse-outline';
  return <Ionicons name={ioniconName} size={size} color={color} style={style} />;
}

const styles = StyleSheet.create({
  outlineWrapper: {
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
