import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, Camera, PenLine, Sparkles } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@kivo/shared';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const heroOpacity    = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(24)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const ctaTranslateY  = useRef(new Animated.Value(16)).current;
  const card1Scale     = useRef(new Animated.Value(0.93)).current;
  const card2Scale     = useRef(new Animated.Value(0.93)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(heroOpacity,    { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.timing(card1Scale,     { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(card2Scale,     { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(ctaOpacity,    { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      const redirectTo = Linking.createURL('/');
      const subscription = Linking.addEventListener('url', async ({ url }) => {
        subscription.remove();
        await WebBrowser.dismissBrowser();
        const hashPart = url.includes('#') ? url.split('#')[1] : (url.split('?')[1] ?? '');
        const params = Object.fromEntries(
          hashPart.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
        );
        const accessToken  = params['access_token'];
        const refreshToken = params['refresh_token'];
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { subscription.remove(); Alert.alert('Error', error.message); return; }
      if (data?.url) await WebBrowser.openBrowserAsync(data.url);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12, paddingTop: insets.top + 4 }]}>

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
        <Text style={styles.logoTagline}>registro de gastos en grupo</Text>
      </Animated.View>

      {/* ── Hero ── */}
      <Animated.View
        style={[
          styles.heroContainer,
          { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
        ]}
      >
        {/* Demo card */}
        <Animated.View style={[styles.demoCard, { transform: [{ scale: card1Scale }] }]}>

          {/* Input row */}
          <View style={styles.demoInputRow}>
            <View style={styles.demoMicBadge}>
              <Mic size={13} color={COLORS.kivo400} />
            </View>
            <Text style={styles.demoInputText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.demoAiBadge}>
              <Sparkles size={12} color={COLORS.ai} />
              <Text style={styles.demoAiLabel}>IA</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.arrowRow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>Kivo entiende</Text>
            <View style={styles.arrowLine} />
          </View>

          {/* Parsed result */}
          <Animated.View style={[styles.parsedRow, { transform: [{ scale: card2Scale }] }]}>
            <View style={styles.parsedAccentBar} />
            <View style={styles.parsedIcon}>
              <Text style={styles.parsedEmoji}>🚗</Text>
            </View>
            <View style={styles.parsedInfo}>
              <Text style={styles.parsedDesc}>Taxi</Text>
              <Text style={styles.parsedMeta}>División igual · 4 personas</Text>
            </View>
            <View style={styles.parsedRight}>
              <Text style={styles.parsedAmount}>$40.00</Text>
              <View style={styles.parsedSplitBadge}>
                <Text style={styles.parsedSplitText}>$10 c/u</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Input methods row */}
        <View style={styles.methodsRow}>
          {[
            { icon: Mic,     label: 'Voz',   color: COLORS.kivo400 },
            { icon: Camera,  label: 'Foto',  color: COLORS.ai },
            { icon: PenLine, label: 'Texto', color: COLORS.success },
          ].map(({ icon: Icon, label, color }) => (
            <View key={label} style={styles.methodChip}>
              <View style={[styles.methodIconWrap, { backgroundColor: `${color}18` }]}>
                <Icon size={15} color={color} />
              </View>
              <Text style={styles.methodLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tagline */}
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>Anota ahora, ordena después.</Text>
          <Text style={styles.taglineSub}>
            Voz, foto o texto — tu grupo siempre al día.
          </Text>
        </View>
      </Animated.View>

      {/* ── Auth CTAs ── */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
        ]}
      >
        {/* Google */}
        <TouchableOpacity
          style={styles.btnSocial}
          onPress={() => handleOAuth('google')}
          activeOpacity={0.82}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <View style={styles.btnSocialInner}>
              <GoogleIcon />
              <Text style={styles.btnSocialText}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Apple — iOS only */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.btnSocial}
            onPress={() => handleOAuth('apple')}
            activeOpacity={0.82}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'apple' ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <View style={styles.btnSocialInner}>
                <AppleIcon />
                <Text style={styles.btnSocialText}>Continuar con Apple</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con correo</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email */}
        <TouchableOpacity
          style={styles.btnEmail}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.78}
        >
          <Text style={styles.btnEmailText}>Continuar con correo</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Al continuar aceptas los{' '}
          <Text style={styles.legalLink}>Términos</Text>
          {' '}y la{' '}
          <Text style={styles.legalLink}>Privacidad</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Mini SVG icons (no native dependency) ────────────────────────────────────

function GoogleIcon() {
  return (
    <View style={socialIconStyles.wrap}>
      <Text style={socialIconStyles.g}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={socialIconStyles.wrap}>
      <Text style={socialIconStyles.apple}></Text>
    </View>
  );
}

const socialIconStyles = StyleSheet.create({
  wrap: {
    width: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  g: {
    fontSize: 16, fontWeight: '700', color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  apple: {
    fontSize: 18, color: '#000', lineHeight: 20,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },

  // ── Orbs ──────────────────────────────────────────────────────
  orb1: {
    position: 'absolute',
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: `${COLORS.kivo500}16`,
    top: -120, left: -80,
  },
  orb2: {
    position: 'absolute',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: `${COLORS.ai}12`,
    top: 80, right: -70,
  },
  orb3: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.kivo400}10`,
    bottom: 140, left: -50,
  },

  // ── Logo ──────────────────────────────────────────────────────
  logoWrap: { alignItems: 'center', gap: 6 },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.kivo500,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: COLORS.kivo500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 22, fontWeight: '800',
    color: '#fff', letterSpacing: -1,
  },
  logoDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.65)',
    marginTop: -8,
  },
  logoTagline: {
    fontSize: 11, color: COLORS.textTertiary,
    fontWeight: '500', letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Hero ──────────────────────────────────────────────────────
  heroContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
  },

  // Demo card
  demoCard: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 8,
  },

  demoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  demoMicBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${COLORS.kivo500}20`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.kivo500}35`,
    flexShrink: 0,
  },
  demoInputText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13, fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  demoAiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${COLORS.ai}18`,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${COLORS.ai}25`,
    flexShrink: 0,
  },
  demoAiLabel: {
    color: COLORS.ai, fontSize: 10, fontWeight: '700',
  },

  arrowRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  arrowLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  arrowLabel: {
    color: COLORS.textTertiary, fontSize: 10, fontWeight: '500', letterSpacing: 0.3,
  },

  parsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: `${COLORS.success}0C`,
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.success}22`,
    overflow: 'hidden',
  },
  parsedAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    backgroundColor: COLORS.success,
    opacity: 0.7,
  },
  parsedIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginLeft: 4,
  },
  parsedEmoji: { fontSize: 17 },
  parsedInfo: { flex: 1, gap: 2 },
  parsedDesc: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  parsedMeta: { color: COLORS.textSecondary, fontSize: 11 },
  parsedRight: { alignItems: 'flex-end', gap: 4 },
  parsedAmount: {
    color: COLORS.textPrimary, fontSize: 16, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
  parsedSplitBadge: {
    backgroundColor: `${COLORS.kivo500}1A`,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${COLORS.kivo500}30`,
  },
  parsedSplitText: { color: COLORS.kivo500, fontSize: 10, fontWeight: '700' },

  // Method chips
  methodsRow: {
    flexDirection: 'row', gap: 8, width: '100%',
  },
  methodChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  methodIconWrap: {
    width: 24, height: 24, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: {
    color: COLORS.textSecondary, fontSize: 12, fontWeight: '500',
  },

  // Tagline
  taglineWrap: { alignItems: 'center', gap: 5 },
  tagline: {
    fontSize: 21, fontWeight: '800',
    color: COLORS.textPrimary, textAlign: 'center',
    letterSpacing: -0.6, lineHeight: 26,
  },
  taglineSub: {
    fontSize: 13, color: COLORS.textTertiary,
    textAlign: 'center', lineHeight: 18,
  },

  // ── Auth CTAs ──────────────────────────────────────────────────
  ctaContainer: {
    width: '100%',
    gap: 9,
    alignItems: 'center',
  },

  btnSocial: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  btnSocialInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  btnSocialText: {
    color: COLORS.textPrimary, fontSize: 15, fontWeight: '500',
  },

  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%', marginVertical: 1,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 11, fontWeight: '500' },

  btnEmail: {
    width: '100%',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnEmailText: {
    color: COLORS.textTertiary, fontSize: 14, fontWeight: '500',
  },

  legal: {
    color: COLORS.textTertiary, fontSize: 11,
    textAlign: 'center', marginTop: -2,
  },
  legalLink: { color: COLORS.kivo400 },
});
