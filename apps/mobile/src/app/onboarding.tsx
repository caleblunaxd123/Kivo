import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@kivo/shared';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const heroOpacity    = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(20)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const ctaTranslateY  = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(heroOpacity,    { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(ctaOpacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Background particles — simplified static version */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Text style={styles.logo}>kivo</Text>
        <View style={styles.logoDot} />
      </Animated.View>

      {/* Hero */}
      <Animated.View
        style={[
          styles.heroContainer,
          { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
        ]}
      >
        {/* Animated illustration (static placeholder) */}
        <View style={styles.heroIllustration}>
          <View style={styles.heroCard}>
            <Text style={styles.heroCardEmoji}>🎤</Text>
            <Text style={styles.heroCardText}>"Taxi 40 dólares, entre 4"</Text>
          </View>
          <View style={styles.heroArrow}>
            <Text style={styles.heroArrowText}>✦</Text>
          </View>
          <View style={styles.heroRow}>
            <Text style={styles.heroRowEmoji}>🚗</Text>
            <Text style={styles.heroRowDesc}>Taxi</Text>
            <Text style={styles.heroRowAmount}>$40.00</Text>
            <Text style={styles.heroRowSplit}>÷4</Text>
          </View>
        </View>

        <Text style={styles.tagline}>
          Habla, toma foto o escribe…
        </Text>
        <Text style={styles.taglineAccent}>
          y todo se ordena solo.
        </Text>
        <Text style={styles.subtitle}>
          Registra gastos en grupo de forma rápida,{'\n'}
          sin formularios ni cuadernos.
        </Text>
      </Animated.View>

      {/* CTAs */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Empezar gratis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>Ya tengo cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Al continuar aceptas los{' '}
          <Text style={styles.legalLink}>Términos de uso</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  // Background orbs
  bgOrb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${COLORS.kivo500}08`,
    top: -80,
    left: -80,
  },
  bgOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${COLORS.ai}06`,
    bottom: 100,
    right: -60,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1.5,
  },
  logoDot: {
    position: 'absolute',
    top: 4,
    right: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.kivo500,
  },

  // Hero
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  heroIllustration: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    gap: 12,
    marginBottom: 8,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 12,
  },
  heroCardEmoji: { fontSize: 20 },
  heroCardText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  heroArrow: { alignItems: 'center' },
  heroArrowText: { color: COLORS.ai, fontSize: 18 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${COLORS.success}10`,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: `${COLORS.success}25`,
  },
  heroRowEmoji: { fontSize: 16 },
  heroRowDesc: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500', flex: 1 },
  heroRowAmount: { color: COLORS.textPrimary, fontSize: 14, fontFamily: 'monospace', fontWeight: '600' },
  heroRowSplit: { color: COLORS.kivo400, fontSize: 13, fontWeight: '600' },

  tagline: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  taglineAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },

  // CTAs
  ctaContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: COLORS.kivo500,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  btnSecondaryText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  legal: {
    color: COLORS.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  legalLink: { color: COLORS.kivo400, textDecorationLine: 'underline' },
});
