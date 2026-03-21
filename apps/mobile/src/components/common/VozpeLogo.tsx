/**
 * VozpeLogo — Componente de marca oficial
 *
 * Aproxima visualmente el logo de VozPE:
 *   [ícono mic en burbuja teal] + [Voz en navy] + [PE en lime]
 *
 * Cuando tengas el archivo PNG exportado, colócalo en:
 *   apps/mobile/assets/logo-vozpe.png
 * y descomenta el bloque de <Image> abajo para usarlo directamente.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Mic } from 'lucide-react-native';
import { COLORS } from '@vozpe/shared';

// ─── Descomentar cuando tengas el PNG ────────────────────────────────────────
// const logoAsset = require('../../../assets/logo-vozpe.png');

interface VozpeLogoProps {
  /** Tamaño base del ícono — el texto escala proporcionalmente */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Mostrar solo el ícono sin el texto */
  iconOnly?: boolean;
  /** Variante: 'full' = ícono + texto | 'text' = solo texto */
  variant?: 'full' | 'text' | 'icon';
}

const SIZES = {
  sm: { icon: 28, fontSize: 18, gap: 8  },
  md: { icon: 36, fontSize: 24, gap: 10 },
  lg: { icon: 44, fontSize: 30, gap: 12 },
  xl: { icon: 56, fontSize: 38, gap: 14 },
};

export function VozpeLogo({ size = 'md', variant = 'full' }: VozpeLogoProps) {
  const s = SIZES[size];

  // ── Cuando tengas el PNG, usa esto en lugar del bloque de abajo: ──────────
  // return (
  //   <Image
  //     source={logoAsset}
  //     style={{ height: s.icon * 1.1, width: s.icon * 3.8 }}
  //     resizeMode="contain"
  //   />
  // );
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.row, { gap: s.gap }]}>
      {/* ── Ícono: mic en burbuja teal (aproxima el logo) ── */}
      {variant !== 'text' && (
        <View style={[
          styles.iconBubble,
          {
            width:  s.icon,
            height: s.icon,
            borderRadius: s.icon * 0.28,
            shadowColor: COLORS.vozpe500,
          },
        ]}>
          {/* Círculo interno más oscuro (burbuja de chat) */}
          <View style={[styles.iconInner, { borderRadius: s.icon * 0.22 }]}>
            <Mic size={s.icon * 0.48} color="#fff" strokeWidth={2} />
          </View>
          {/* Dots decorativos (antenas del logo) */}
          <View style={[styles.dot, styles.dotTL, { width: s.icon * 0.12, height: s.icon * 0.12, borderRadius: s.icon * 0.06 }]} />
          <View style={[styles.dot, styles.dotTR, { width: s.icon * 0.10, height: s.icon * 0.10, borderRadius: s.icon * 0.05 }]} />
          <View style={[styles.dot, styles.dotTop, { width: s.icon * 0.08, height: s.icon * 0.08, borderRadius: s.icon * 0.04 }]} />
        </View>
      )}

      {/* ── Texto: "Voz" navy + "PE" lime ── */}
      {variant !== 'icon' && (
        <View style={styles.textRow}>
          <Text style={[styles.textVoz, { fontSize: s.fontSize }]}>
            Voz
          </Text>
          <Text style={[styles.textPE, { fontSize: s.fontSize }]}>
            PE
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Ícono
  iconBubble: {
    backgroundColor: COLORS.vozpe500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'visible',
  },
  iconInner: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dots decorativos (antenas)
  dot: {
    position: 'absolute',
    backgroundColor: COLORS.vozpeGreenBright,
  },
  dotTL: { top: -3, left: '30%', backgroundColor: COLORS.vozpe300 },
  dotTR: { top: -5, right: '20%', backgroundColor: COLORS.vozpeGreenBright },
  dotTop: { top: -7, left: '55%', backgroundColor: '#FACC15' }, // amarillo — igual que en el logo

  // Texto
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  textVoz: {
    fontWeight: '800',
    color: COLORS.vozpeNavy,
    letterSpacing: -1,
    lineHeight: undefined,
  },
  textPE: {
    fontWeight: '800',
    color: COLORS.vozpeGreen,
    letterSpacing: -1,
    lineHeight: undefined,
  },
});
