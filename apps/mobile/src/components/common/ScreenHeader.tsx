import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { T } from '../../theme/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  right,
  transparent = false,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        !transparent && styles.headerSolid,
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={T.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  headerSolid: {
    backgroundColor: T.appBg,
    borderBottomWidth: 1,
    borderBottomColor: T.strokeSoft,
  },
  left:   { width: 40, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right:  { width: 40, alignItems: 'flex-end' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.blueSoft,
  },
  title: {
    color: T.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: T.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
});
