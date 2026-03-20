import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@kivo/shared';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
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
      activeOpacity={0.75}
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
          color={variant === 'primary' ? '#fff' : COLORS.kivo500}
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
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },

  // Variants
  variant_primary: { backgroundColor: COLORS.kivo500 },
  variant_secondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.borderDefault,
  },
  variant_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  variant_danger: { backgroundColor: COLORS.error },
  variant_ai: {
    backgroundColor: COLORS.aiMuted,
    borderColor: COLORS.ai,
  },

  // Sizes
  size_sm: { paddingHorizontal: 12, paddingVertical: 8 },
  size_md: { paddingHorizontal: 16, paddingVertical: 12 },
  size_lg: { paddingHorizontal: 20, paddingVertical: 15 },

  // Label base
  label: { fontWeight: '600', letterSpacing: -0.2 },

  // Label variants
  labelVariant_primary:   { color: '#fff' },
  labelVariant_secondary: { color: COLORS.textPrimary },
  labelVariant_ghost:     { color: COLORS.textSecondary },
  labelVariant_danger:    { color: '#fff' },
  labelVariant_ai:        { color: COLORS.ai },

  // Label sizes
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 16 },
});
