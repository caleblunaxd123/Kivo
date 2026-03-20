import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@kivo/shared';
import { EmptyState } from '../../components/common/EmptyState';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividad</Text>
      </View>
      <EmptyState
        emoji="📡"
        title="Sin actividad reciente"
        subtitle="Cuando alguien agregue o edite una entrada en tus grupos, aparecerá aquí."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.4 },
});
