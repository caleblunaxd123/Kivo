import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { T } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' || variant === 'success' ? '#fff' : T.blue}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.label,
              styles[`labelVariant_${variant}`],
              styles[`labelSize_${size}`],
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: T.rBtn,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.42 },

  // ── Variants ──────────────────────────────────────────────────────────────
  variant_primary: {
    backgroundColor: T.blue,
    borderColor: 'transparent',
    ...T.shadowBtn,
  },
  variant_secondary: {
    backgroundColor: T.blueSoft,
    borderColor: T.strokeBlue,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: T.error,
    borderColor: 'transparent',
  },
  variant_success: {
    backgroundColor: T.green,
    borderColor: 'transparent',
  },

  // ── Sizes ─────────────────────────────────────────────────────────────────
  size_sm: { paddingHorizontal: 14, paddingVertical: 9,  minHeight: 36 },
  size_md: { paddingHorizontal: 18, paddingVertical: 13, minHeight: 44 },
  size_lg: { paddingHorizontal: 22, paddingVertical: 15, minHeight: 52 },

  // ── Label base ────────────────────────────────────────────────────────────
  label: { fontWeight: '700', letterSpacing: -0.1 },

  // ── Label variants ────────────────────────────────────────────────────────
  labelVariant_primary:   { color: T.textInverse },
  labelVariant_secondary: { color: T.blue },
  labelVariant_ghost:     { color: T.textSecondary },
  labelVariant_danger:    { color: T.textInverse },
  labelVariant_success:   { color: T.textInverse },

  // ── Label sizes ───────────────────────────────────────────────────────────
  labelSize_sm: { fontSize: T.fsSm },
  labelSize_md: { fontSize: T.fsBase },
  labelSize_lg: { fontSize: T.fsLg },
});
