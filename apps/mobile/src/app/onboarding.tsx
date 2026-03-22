import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, PenLine, Mic, Mail, Sparkles } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@vozpe/shared';
import { supabase } from '../lib/supabase';
import { VozpeLogo } from '../components/common/VozpeLogo';

const { width: SW } = Dimensions.get('window');

// ── Teal / cyan — colores del logo VozPE ─────────────────────────────────────
const TEAL      = '#48CAC1';
const TEAL_MID  = '#64D4CC';
const TEAL_SOFT = '#A7EDE8';
const BG_BASE   = '#DFF8F7';   // fondo principal — teal muy suave
const PURPLE    = '#9575CD';
const GREEN_CHI = '#48C878';

// ─── OAuth redirect ────────────────────────────────────────────────────────────
function getRedirectUrl(): string {
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo:', url);
  return url;
}

// ─── Pantalla ──────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  // Animaciones
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const heroAnim  = useRef(new Animated.Value(0)).current;
  const heroY     = useRef(new Animated.Value(20)).current;
  const ctaAnim   = useRef(new Animated.Value(0)).current;
  const ctaY      = useRef(new Animated.Value(14)).current;
  const card1S    = useRef(new Animated.Value(0.93)).current;
  const card2S    = useRef(new Animated.Value(0.93)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(heroAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroY,     { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(card1S,    { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(card2S,    { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(ctaAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(ctaY,    { toValue: 0, duration: 360, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // ── OAuth ──────────────────────────────────────────────────────────────────
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
      if (result.type !== 'success' || !result.url) return;

      const returnedUrl = result.url;

      // PKCE flow
      const qs = returnedUrl.includes('?') ? returnedUrl.split('?')[1] : '';
      const qp = Object.fromEntries(
        qs.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
      );
      if (qp['code']) {
        const { error: ex } = await supabase.auth.exchangeCodeForSession(qp['code']);
        if (ex) Alert.alert('Error', ex.message);
        return;
      }

      // Implicit fallback
      const hash = returnedUrl.includes('#') ? returnedUrl.split('#')[1] : '';
      const hp   = Object.fromEntries(
        hash.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
      );
      if (hp['access_token'] && hp['refresh_token']) {
        await supabase.auth.setSession({ access_token: hp['access_token'], refresh_token: hp['refresh_token'] });
      } else {
        Alert.alert(
          'Login con Google',
          `Agrega esta URL en Supabase → Auth → Redirect URLs:\n${redirectTo}`,
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al iniciar sesión');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Orbs de fondo teal ─────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />
        <View style={styles.orb4} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── Logo ──────────────────────────────────────────────── */}
        <Animated.View style={[styles.logoWrap, { opacity: logoAnim }]}>
          <VozpeLogo size="xxl" />
        </Animated.View>

        {/* ── Demo card ─────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.demoCard,
            { opacity: heroAnim, transform: [{ translateY: heroY }] },
          ]}
        >
          {/* Input de voz — pill teal */}
          <Animated.View style={[styles.voicePill, { transform: [{ scale: card1S }] }]}>
            <View style={styles.voiceMicBadge}>
              <Mic size={14} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.voicePillText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.voiceSparkle}>
              <Sparkles size={13} color="rgba(255,255,255,0.85)" />
            </View>
          </Animated.View>

          {/* Resultado parseado */}
          <Animated.View style={[styles.parsedRow, { transform: [{ scale: card2S }] }]}>
            <View style={styles.parsedIcon}>
              <Text style={styles.parsedEmoji}>🚗</Text>
            </View>
            <View style={styles.parsedInfo}>
              <Text style={styles.parsedTitle}>Taxi</Text>
              <Text style={styles.parsedSub}>División igual · 4 personas</Text>
            </View>
            <View style={styles.parsedRight}>
              <Text style={styles.parsedAmount}>$40,00</Text>
              <View style={styles.perPersonBadge}>
                <Text style={styles.perPersonText}>$10 c/u</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── Method chips ──────────────────────────────────────── */}
        <Animated.View style={[styles.chipsRow, { opacity: heroAnim }]}>
          {[
            { icon: Mic,     label: 'Voz',   bg: `${TEAL}22`,    border: `${TEAL}55`,    ic: TEAL    },
            { icon: Camera,  label: 'Foto',  bg: `${PURPLE}22`,  border: `${PURPLE}55`,  ic: PURPLE  },
            { icon: PenLine, label: 'Texto', bg: `${GREEN_CHI}22`, border: `${GREEN_CHI}55`, ic: GREEN_CHI },
          ].map(({ icon: Icon, label, bg, border, ic }) => (
            <View key={label} style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
              <View style={[styles.chipIconWrap, { backgroundColor: ic + '33' }]}>
                <Icon size={14} color={ic} strokeWidth={2} />
              </View>
              <Text style={[styles.chipLabel, { color: ic }]}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Tagline ───────────────────────────────────────────── */}
        <Animated.View style={[styles.taglineWrap, { opacity: heroAnim }]}>
          <Text style={styles.tagline}>Anota ahora, ordena después.</Text>
          <Text style={styles.taglineSub}>
            Sin formularios, sin caos.{'\n'}Solo tú y tu grupo.
          </Text>
        </Animated.View>

        {/* ── Auth ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.authWrap,
            { opacity: ctaAnim, transform: [{ translateY: ctaY }] },
          ]}
        >
          {/* Google — estilo estándar Google */}
          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={() => handleOAuth('google')}
            activeOpacity={0.82}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator size="small" color="#5F6368" />
            ) : (
              <>
                <GoogleIcon size={22} />
                <Text style={styles.btnGoogleText}>Iniciar sesión con Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Correo — pill teal sólido */}
          <TouchableOpacity
            style={styles.btnEmail}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.80}
          >
            <Mail size={18} color="#fff" strokeWidth={2} />
            <Text style={styles.btnEmailText}>Acceder con correo electrónico</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legal}>
            Al continuar aceptas los{' '}
            <Text style={styles.legalLink}>Términos</Text>
            {' '}y la{' '}
            <Text style={styles.legalLink}>Privacidad</Text>.
          </Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ─── Google icon (colores oficiales) ──────────────────────────────────────────
function GoogleIcon({ size = 22 }: { size?: number }) {
  const h = size / 2;
  const r = size * 0.27;
  const off = size * 0.5 - r;
  return (
    <View style={{ width: size, height: size, borderRadius: h, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0,  top: 0,      width: h, height: h, backgroundColor: '#4285F4' }} />
      <View style={{ position: 'absolute', right: 0, top: 0,      width: h, height: h, backgroundColor: '#EA4335' }} />
      <View style={{ position: 'absolute', left: 0,  bottom: 0,   width: h, height: h, backgroundColor: '#34A853' }} />
      <View style={{ position: 'absolute', right: 0, bottom: 0,   width: h, height: h, backgroundColor: '#FBBC04' }} />
      <View style={{
        position: 'absolute', left: off, top: off,
        width: r * 2, height: r * 2, borderRadius: r,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: r * 0.95, fontWeight: '700', color: '#4285F4', lineHeight: r * 1.15 }}>G</Text>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_BASE,
  },

  // ── Orbs ─────────────────────────────────────────────────────
  orb1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: `${TEAL_SOFT}60`,
    top: -120, right: -80,
  },
  orb2: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: `${TEAL_MID}30`,
    top: 80, left: -100,
  },
  orb3: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: `${TEAL_SOFT}40`,
    bottom: 200, right: -70,
  },
  orb4: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: `${TEAL}20`,
    bottom: 40, left: -40,
  },

  // ── Scroll ───────────────────────────────────────────────────
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
    gap: 18,
  },

  // ── Logo ─────────────────────────────────────────────────────
  logoWrap: {
    alignItems: 'center',
    marginHorizontal: -22,   // contrarrestar padding del scroll para usar ancho completo
    paddingVertical: 8,
  },

  // ── Demo card ────────────────────────────────────────────────
  demoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 22,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  // Voice input pill
  voicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TEAL,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  voiceMicBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  voicePillText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  voiceSparkle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Parsed row
  parsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: `${GREEN_CHI}30`,
    borderLeftColor: GREEN_CHI,
  },
  parsedIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F8FFFE',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E8F8F7',
  },
  parsedEmoji: { fontSize: 20 },
  parsedInfo: { flex: 1, gap: 2 },
  parsedTitle: { color: '#1A1A2E', fontSize: 15, fontWeight: '700' },
  parsedSub: { color: '#666', fontSize: 11 },
  parsedRight: { alignItems: 'flex-end', gap: 5 },
  parsedAmount: {
    color: '#1A1A2E', fontSize: 19, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
  perPersonBadge: {
    backgroundColor: `${TEAL}22`,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${TEAL}44`,
  },
  perPersonText: { color: TEAL_DARK, fontSize: 10, fontWeight: '700' },

  // ── Method chips ─────────────────────────────────────────────
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  chipIconWrap: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 13, fontWeight: '600',
  },

  // ── Tagline ──────────────────────────────────────────────────
  taglineWrap: { alignItems: 'center', gap: 5 },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A3A38',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  taglineSub: {
    fontSize: 13.5,
    color: '#4A7A77',
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Auth ─────────────────────────────────────────────────────
  authWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 11,
  },

  // Google — estilo oficial Google
  btnGoogle: {
    width: '100%', height: 52,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1, borderColor: '#DADCE0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  btnGoogleText: {
    color: '#3C4043', fontSize: 15, fontWeight: '500',
  },

  // Email — pill teal sólido
  btnEmail: {
    width: '100%', height: 52,
    backgroundColor: TEAL,
    borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 5,
  },
  btnEmailText: {
    color: '#fff', fontSize: 15, fontWeight: '600',
  },

  // Legal
  legal: {
    color: '#4A7A77', fontSize: 11, textAlign: 'center',
  },
  legalLink: { color: TEAL_DARK, fontWeight: '600' },
});
