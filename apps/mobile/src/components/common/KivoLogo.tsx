/**
 * KivoLogo — Logo oficial de Kivo
 * Usa el asset PNG en apps/mobile/assets/logo-vozpe.png
 */

import React from 'react';
import { Image, ImageStyle, StyleProp, Dimensions } from 'react-native';

// Asset PNG con fondo transparente
const logoAsset = require('../../../assets/logo-vozpe.png');

const SW = Dimensions.get('window').width;

// Dimensiones por tamaño (ratio ~3.8:1 basado en el logo horizontal)
const SIZES = {
  xs:  { height: 28,  width: 106 },
  sm:  { height: 38,  width: 144 },
  md:  { height: 50,  width: 190 },
  lg:  { height: 70,  width: 266 },
  xl:  { height: 90,  width: 342 },
  xxl: { height: 300, width: SW },
};

interface KivoLogoProps {
  size?: keyof typeof SIZES;
  style?: StyleProp<ImageStyle>;
}

export function KivoLogo({ size = 'md', style }: KivoLogoProps) {
  const { height, width } = SIZES[size];
  return (
    <Image
      source={logoAsset}
      style={[{ height, width }, style]}
      resizeMode="contain"
    />
  );
}
