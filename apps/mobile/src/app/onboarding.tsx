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
import { Mic, Camera, PenLine, Sparkles } from 'lucide-react-native';
import { COLORS } from '@kivo/shared';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const heroOpacity    = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(28)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const ctaTranslateY  = useRef(new Animated.Value(20)).current;
  const card1Scale     = useRef(new Animated.Value(0.92)).current;
  const card2Scale     = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(heroOpacity,    { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(card1Scale,     { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(card2Scale,     { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(ctaOpacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16, paddingTop: insets.top + 8 }]}>

      {/* ── Background orbs ── */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      {/* ── Logo ── */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>kivo</Text>
          <View style={styles.logoDot} />
        </View>
      </Animated.View>

      {/* ── Hero ── */}
      <Animated.View
        style={[
          styles.heroContainer,
          { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
        ]}
      >
        {/* Demo card — input */}
        <Animated.View style={[styles.demoCard, { transform: [{ scale: card1Scale }] }]}>
          <View style={styles.demoInputRow}>
            <View style={styles.demoMicBadge}>
              <Mic size={14} color={COLORS.kivo400} />
            </View>
            <Text style={styles.demoInputText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.demoSparkle}>
              <Sparkles size={13} color={COLORS.ai} />
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrowRow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>Kivo entiende</Text>
            <View style={styles.arrowLine} />
          </View>

          {/* Parsed result */}
          <Animated.View style={[styles.parsedRow, { transform: [{ scale: card2Scale }] }]}>
            <View style={styles.parsedIcon}>
              <Text style={styles.parsedEmoji}>🚗</Text>
            </View>
            <View style={styles.parsedInfo}>
              <Text style={styles.parsedDesc}>Taxi</Text>
              <Text style={styles.parsedMeta}>División igual · 4 personas</Text>
            </View>
            <View style={styles.parsedAmountWrap}>
              <Text style={styles.parsedAmount}>$40.00</Text>
              <View style={styles.parsedSplitBadge}>
                <Text style={styles.parsedSplitText}>÷4</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Input methods row */}
        <View style={styles.methodsRow}>
          {[
            { icon: Mic,     label: 'Voz',  color: COLORS.kivo400 },
            { icon: Camera,  label: 'Foto', color: COLORS.ai },
            { icon: PenLine, label: 'Texto',color: COLORS.success },
          ].map(({ icon: Icon, label, color }) => (
            <View key={label} style={styles.methodChip}>
              <View style={[styles.methodIconWrap, { backgroundColor: `${color}18` }]}>
                <Icon size={16} color={color} />
              </View>
              <Text style={styles.methodLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tagline */}
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>Habla, foto o escribe —</Text>
          <Text style={styles.taglineAccent}>todo se ordena solo.</Text>
          <Text style={styles.taglineSub}>
            Sin formularios. Sin cuadernos. Sin caos.
          </Text>
        </View>
      </Animated.View>

      {/* ── CTAs ── */}
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
    overflow: 'hidden',
  },

  // ── Orbs ──────────────────────────────────────────────────────
  orb1: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: `${COLORS.kivo500}18`,
    top: -120,
    left: -100,
  },
  orb2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${COLORS.ai}14`,
    top: 60,
    right: -80,
  },
  orb3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${COLORS.kivo400}12`,
    bottom: 120,
    left: -40,
  },

  // ── Logo ──────────────────────────────────────────────────────
  logoWrap: { alignItems: 'center' },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.kivo500,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: COLORS.kivo500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  logoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: -8,
  },

  // ── Hero ──────────────────────────────────────────────────────
  heroContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
  },

  demoCard: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    gap: 14,
    // Shadow — visible on light bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  demoInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  demoMicBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${COLORS.kivo500}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.kivo500}40`,
  },
  demoInputText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  demoSparkle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.ai}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderDefault,
  },
  arrowLabel: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  parsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${COLORS.success}0E`,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: `${COLORS.success}20`,
  },
  parsedIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  parsedEmoji: { fontSize: 18 },
  parsedInfo: { flex: 1, gap: 2 },
  parsedDesc: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  parsedMeta: { color: COLORS.textSecondary, fontSize: 12 },
  parsedAmountWrap: { alignItems: 'flex-end', gap: 4 },
  parsedAmount: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: -0.5,
  },
  parsedSplitBadge: {
    backgroundColor: `${COLORS.kivo500}20`,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${COLORS.kivo500}35`,
  },
  parsedSplitText: { color: COLORS.kivo400, fontSize: 11, fontWeight: '700' },

  // Input methods
  methodsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  methodChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  methodIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  // Tagline
  taglineWrap: { alignItems: 'center', gap: 4 },
  tagline: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  taglineAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginTop: -2,
  },
  taglineSub: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // ── CTAs ──────────────────────────────────────────────────────
  ctaContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: COLORS.kivo500,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.kivo500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
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
    marginTop: 2,
  },
  legalLink: {
    color: COLORS.kivo400,
    textDecorationLine: 'underline',
  },
});
