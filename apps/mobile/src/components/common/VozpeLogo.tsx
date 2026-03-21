/**
 * VozpeLogo — Logo oficial de VozPE
 * Usa el asset PNG en apps/mobile/assets/logo-vozpe.png
 */

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// Asset PNG con fondo transparente
const logoAsset = require('../../../assets/logo-vozpe.png');

// Dimensiones por tamaño (ratio ~3.8:1 basado en el logo horizontal)
const SIZES = {
  xs:  { height: 22,  width: 84  },
  sm:  { height: 30,  width: 114 },
  md:  { height: 40,  width: 152 },
  lg:  { height: 52,  width: 198 },
  xl:  { height: 66,  width: 251 },
};

interface VozpeLogoProps {
  size?: keyof typeof SIZES;
  style?: StyleProp<ImageStyle>;
}

export function VozpeLogo({ size = 'md', style }: VozpeLogoProps) {
  const { height, width } = SIZES[size];
  return (
    <Image
      source={logoAsset}
      style={[{ height, width }, style]}
      resizeMode="contain"
    />
  );
}
