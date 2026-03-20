import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@kivo/shared';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaSecondaryLabel?: string;
  onCtaSecondary?: () => void;
}

export function EmptyState({
  emoji = '📋',
  title,
  subtitle,
  ctaLabel,
  onCta,
  ctaSecondaryLabel,
  onCtaSecondary,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onCta && (
        <View style={styles.actions}>
          <Button label={ctaLabel} onPress={onCta} size="md" style={styles.cta} />
          {ctaSecondaryLabel && onCtaSecondary && (
            <Button
              label={ctaSecondaryLabel}
              onPress={onCtaSecondary}
              variant="secondary"
              size="md"
              style={styles.cta}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emoji: { fontSize: 48, marginBottom: 4 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: { marginTop: 8, gap: 8, width: '100%' },
  cta: { width: '100%' },
});
