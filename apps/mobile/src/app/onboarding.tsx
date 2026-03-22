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
import { Camera, PenLine, Sparkles, Mic, Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { COLORS } from '@vozpe/shared';

function getRedirectUrl(): string {
  if (__DEV__) {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (projectId) return `exp://u.expo.dev/${projectId}`;
  }
  return Linking.createURL('/');
}
import { supabase } from '../lib/supabase';
import { VozpeLogo } from '../components/common/VozpeLogo';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const heroOpacity    = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(22)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const ctaTranslateY  = useRef(new Animated.Value(14)).current;
  const card1Scale     = useRef(new Animated.Value(0.94)).current;
  const card2Scale     = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(heroOpacity,    { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: 520, useNativeDriver: true }),
        Animated.timing(card1Scale,     { toValue: 1, duration: 620, useNativeDriver: true }),
        Animated.timing(card2Scale,     { toValue: 1, duration: 720, useNativeDriver: true }),
      ]),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(ctaOpacity,    { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 360, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { Alert.alert('Error', error.message); return; }
      if (!data?.url) return;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        const hashPart = result.url.includes('#')
          ? result.url.split('#')[1]
          : (result.url.split('?')[1] ?? '');
        const params = Object.fromEntries(
          hashPart.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
        );
        const at = params['access_token'];
        const rt = params['refresh_token'];
        if (at && rt) await supabase.auth.setSession({ access_token: at, refresh_token: rt });
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 14, paddingTop: insets.top + 6 }]}>

      {/* ── Orbs de fondo ── */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />
      <View style={styles.orb4} />

      {/* ── Logo ── */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
        <VozpeLogo size="lg" />
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

          {/* Voice input row */}
          <View style={styles.demoInputRow}>
            <View style={styles.demoMicBadge}>
              <Mic size={13} color={COLORS.vozpe500} />
            </View>
            <Text style={styles.demoInputText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.demoSparkle}>
              <Sparkles size={12} color={COLORS.ai} />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.arrowRow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>Vozpe entiende</Text>
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
            <View style={styles.parsedRight}>
              <Text style={styles.parsedAmount}>$40.00</Text>
              <View style={styles.parsedPerPersonBadge}>
                <Text style={styles.parsedPerPerson}>$10 c/u</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Method chips */}
        <View style={styles.methodsRow}>
          {[
            { icon: Mic,     label: 'Voz',   color: COLORS.vozpe500 },
            { icon: Camera,  label: 'Foto',  color: COLORS.ai },
            { icon: PenLine, label: 'Texto', color: COLORS.success },
          ].map(({ icon: Icon, label, color }) => (
            <View key={label} style={styles.methodChip}>
              <View style={[styles.methodIconWrap, { backgroundColor: `${color}18` }]}>
                <Icon size={14} color={color} />
              </View>
              <Text style={styles.methodLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tagline */}
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>Anota ahora,{'\n'}ordena después.</Text>
          <Text style={styles.taglineSub}>Sin formularios, sin caos.{'\n'}Solo tú y tu grupo.</Text>
        </View>
      </Animated.View>

      {/* ── Auth ── */}
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
          activeOpacity={0.80}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <View style={styles.btnSocialInner}>
              <GoogleColorIcon size={22} />
              <Text style={styles.btnSocialText}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Apple — solo iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.btnSocial}
            onPress={() => handleOAuth('apple')}
            activeOpacity={0.80}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'apple' ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <View style={styles.btnSocialInner}>
                <AppleIcon size={22} />
                <Text style={styles.btnSocialText}>Continuar con Apple</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Correo — botón visible, no escondido */}
        <TouchableOpacity
          style={styles.btnEmail}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.75}
        >
          <Mail size={16} color={COLORS.textSecondary} />
          <Text style={styles.btnEmailText}>Acceder con correo electrónico</Text>
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

// ─── Ícono Google en sus 4 colores reales ─────────────────────────────────────
function GoogleColorIcon({ size = 22 }: { size?: number }) {
  const h = size / 2;
  const innerR = size * 0.27;
  const innerOffset = size * 0.5 - innerR;
  return (
    <View style={{ width: size, height: size, borderRadius: h, overflow: 'hidden' }}>
      {/* Azul — arriba izquierda */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: h, height: h, backgroundColor: '#4285F4' }} />
      {/* Rojo — arriba derecha */}
      <View style={{ position: 'absolute', right: 0, top: 0, width: h, height: h, backgroundColor: '#EA4335' }} />
      {/* Verde — abajo izquierda */}
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: h, height: h, backgroundColor: '#34A853' }} />
      {/* Amarillo — abajo derecha */}
      <View style={{ position: 'absolute', right: 0, bottom: 0, width: h, height: h, backgroundColor: '#FBBC04' }} />
      {/* Centro blanco con G */}
      <View style={{
        position: 'absolute',
        left: innerOffset, top: innerOffset,
        width: innerR * 2, height: innerR * 2,
        borderRadius: innerR,
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: innerR * 0.95, fontWeight: '700', color: '#4285F4', lineHeight: innerR * 1.1 }}>G</Text>
      </View>
    </View>
  );
}

// ─── Ícono Apple ──────────────────────────────────────────────────────────────
function AppleIcon({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.82, color: '#000', lineHeight: size }}>

      </Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    overflow: 'hidden',
  },

  // ── Orbs ────────────────────────────────────────────────────────
  // Orb 1: arriba izquierda — teal (color del ícono del logo)
  orb1: {
    position: 'absolute',
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: `${COLORS.vozpe500}16`,
    top: -110, left: -90,
  },
  // Orb 2: arriba derecha — navy suave (color "Voz")
  orb2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.vozpeNavy}0C`,
    top: 20, right: -60,
  },
  // Orb 3: centro derecha — cyan claro
  orb3: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: `${COLORS.vozpe400}0C`,
    top: '28%', right: -100,
  },
  // Orb 4: abajo izquierda — lime suave (color "PE")
  orb4: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: `${COLORS.vozpeGreen}0A`,
    bottom: 60, left: -70,
  },

  // ── Logo ─────────────────────────────────────────────────────────
  logoWrap: { alignItems: 'center', paddingVertical: 6 },

  // ── Hero ─────────────────────────────────────────────────────────
  heroContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 10,
  },

  // Demo card
  demoCard: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    gap: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 8,
  },

  demoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  demoMicBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: `${COLORS.vozpe500}18`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.vozpe500}30`,
    flexShrink: 0,
  },
  demoInputText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13, fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  demoSparkle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: `${COLORS.ai}15`,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  arrowRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  arrowLine: {
    flex: 1, height: 1, backgroundColor: COLORS.borderSubtle,
  },
  arrowLabel: {
    color: COLORS.textTertiary, fontSize: 10.5,
    fontWeight: '500', letterSpacing: 0.3,
  },

  // Parsed row — usa borderLeftWidth como acento (sin View posicionado)
  parsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: `${COLORS.success}09`,
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: `${COLORS.success}1E`,
    borderLeftColor: COLORS.success,
  },
  parsedIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  parsedEmoji: { fontSize: 18 },
  parsedInfo: { flex: 1, gap: 2 },
  parsedDesc: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  parsedMeta: { color: COLORS.textTertiary, fontSize: 11 },
  parsedRight: { alignItems: 'flex-end', gap: 5 },
  parsedAmount: {
    color: COLORS.textPrimary, fontSize: 18, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.6,
  },
  parsedPerPersonBadge: {
    backgroundColor: `${COLORS.vozpe500}18`,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${COLORS.vozpe500}28`,
  },
  parsedPerPerson: { color: COLORS.vozpe500, fontSize: 10, fontWeight: '700' },

  // Method chips
  methodsRow: {
    flexDirection: 'row', gap: 8, width: '100%',
  },
  methodChip: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  methodIconWrap: {
    width: 24, height: 24, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: {
    color: COLORS.textSecondary, fontSize: 12, fontWeight: '500',
  },

  // Tagline
  taglineWrap: { alignItems: 'center', gap: 6 },
  tagline: {
    fontSize: 23, fontWeight: '800',
    color: COLORS.textPrimary, textAlign: 'center',
    letterSpacing: -0.7, lineHeight: 29,
  },
  taglineSub: {
    fontSize: 13.5, color: COLORS.textTertiary,
    textAlign: 'center', lineHeight: 19,
  },

  // ── Auth ─────────────────────────────────────────────────────────
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },

  btnSocial: {
    width: '100%',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  btnSocialInner: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  btnSocialText: {
    color: COLORS.textPrimary, fontSize: 15, fontWeight: '500',
  },

  // Email: botón visible con borde
  btnEmail: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    backgroundColor: 'transparent',
  },
  btnEmailText: {
    color: COLORS.textSecondary, fontSize: 14, fontWeight: '500',
  },

  legal: {
    color: COLORS.textTertiary, fontSize: 11, textAlign: 'center',
    marginTop: -2,
  },
  legalLink: { color: COLORS.vozpe400 },
});
