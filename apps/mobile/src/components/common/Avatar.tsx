import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { generateInitials, generateMemberColor } from '@vozpe/shared';
import { T } from '../../theme/tokens';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24, sm: 32, md: 40, lg: 56, xl: 80,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 9, sm: 12, md: 15, lg: 20, xl: 28,
};

interface AvatarProps {
  name: string;
  imageUrl?: string;
  colorHex?: string;
  size?: AvatarSize;
  isOnline?: boolean;
}

export function Avatar({
  name,
  imageUrl,
  colorHex,
  size = 'md',
  isOnline,
}: AvatarProps) {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const color = colorHex || generateMemberColor(name);
  const initials = generateInitials(name);

  return (
    <View style={{ width: dim, height: dim }}>
      <View
        style={[
          styles.avatar,
          { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: `${color}25` },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          />
        ) : (
          <Text style={[styles.initials, { fontSize, color }]}>{initials}</Text>
        )}
      </View>
      {isOnline !== undefined && (
        <View
          style={[
            styles.presence,
            { backgroundColor: isOnline ? T.success : T.strokeBlue },
            size === 'xs' && styles.presenceXs,
          ]}
        />
      )}
    </View>
  );
}

export function AvatarGroup({
  members,
  max = 4,
  size = 'sm',
}: {
  members: { name: string; imageUrl?: string; colorHex?: string }[];
  max?: number;
  size?: AvatarSize;
}) {
  const dim = SIZE_MAP[size];
  const visible = members.slice(0, max);
  const overflow = members.length - max;
  const overlap = dim * 0.35;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((m, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -overlap }}>
          <Avatar {...m} size={size} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflowBadge,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <Text style={[styles.overflowText, { fontSize: SIZE_MAP[size] * 0.3 }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: T.strokeSoft,
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  presence: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: T.appBg,
  },
  presenceXs: { width: 7, height: 7, borderRadius: 3.5 },
  overflowBadge: {
    backgroundColor: T.blueSoft,
    borderWidth: 1.5,
    borderColor: T.strokeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    color: T.textSecondary,
    fontWeight: '600',
  },
});
