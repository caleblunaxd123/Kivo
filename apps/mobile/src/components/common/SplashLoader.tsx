/**
 * SplashLoader — Pantalla de carga premium con logo animado
 * Se muestra mientras el AuthStore inicializa la sesión.
 */

import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, Animated, Dimensions, Easing,
} from 'react-native';
import { KivoLogo } from './KivoLogo';
import { T } from '../../theme/tokens';

const { width: SW } = Dimensions.get('window');

export function SplashLoader() {
  // Logo fade + scale
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.88)).current;

  // Tres dots pulsantes
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Orbs decorativos
  const orbOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Logo entra suavemente ──────────────────────────────────────────────
    Animated.parallel([
      Animated.timing(orbOpacity, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1, duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1, damping: 14, stiffness: 100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // ── Dots con pulse secuencial en loop ─────────────────────────────────
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1, duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3, duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const loop = Animated.parallel([
      pulseDot(dot1, 0),
      pulseDot(dot2, 160),
      pulseDot(dot3, 320),
    ]);
    const timeout = setTimeout(() => loop.start(), 700);
    return () => { clearTimeout(timeout); loop.stop(); };
  }, []);

  return (
    <View style={styles.root}>
      {/* Orbs decorativos — igual que onboarding */}
      <Animated.View style={[styles.orbsWrap, { opacity: orbOpacity }]} pointerEvents="none">
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />
      </Animated.View>

      {/* Logo centrado */}
      <Animated.View style={[
        styles.logoWrap,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] },
      ]}>
        <KivoLogo size="lg" />
      </Animated.View>

      {/* Dots loader */}
      <Animated.View style={[styles.dotsRow, { opacity: logoOpacity }]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.appBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },

  orbsWrap: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  } as any,
  orb1: {
    position: 'absolute',
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: T.blue + '12',
    top: -120, right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: T.green + '0E',
    bottom: 80, left: -100,
  },
  orb3: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: T.blue + '0A',
    bottom: 180, right: -50,
  },

  logoWrap: {
    alignItems: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.blue,
  },
});
