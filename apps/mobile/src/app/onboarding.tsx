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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, PenLine, Mic, Mail, Sparkles } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { VozpeLogo } from '../components/common/VozpeLogo';

const { width: SW } = Dimensions.get('window');

// ── Paleta — igual que el logo VozPE (cyan-teal brilloso) ─────────────────────
const BG_BASE    = '#C2E9E7';   // fondo base — teal saturado claro
const TEAL       = '#29B8B3';   // teal primario (botones, pills)
const TEAL_VIVID = '#1ECFC9';   // teal brilloso (orbs principales)
const TEAL_SOFT  = '#7DD8D5';   // teal suave (orbs secundarios)
const TEAL_DARK  = '#1A9B96';   // teal oscuro (textos)
const TEAL_LIGHT = '#A8ECEB';   // teal muy suave (orbs borde)
const PURPLE     = '#9575CD';
const GREEN_CHI  = '#2ECC71';

function getRedirectUrl(): string {
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo:', url);
  return url;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const heroY    = useRef(new Animated.Value(24)).current;
  const ctaAnim  = useRef(new Animated.Value(0)).current;
  const ctaY     = useRef(new Animated.Value(14)).current;
  const card1S   = useRef(new Animated.Value(0.92)).current;
  const card2S   = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(heroAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(heroY,    { toValue: 0, duration: 520, useNativeDriver: true }),
        Animated.timing(card1S,   { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(card2S,   { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(ctaAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(ctaY,    { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleOAuth = async () => {
    setOauthLoading('google');
    try {
      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
        await supabase.auth.setSession({
          access_token: hp['access_token'],
          refresh_token: hp['refresh_token'],
        });
      } else {
        Alert.alert(
          'Configuración requerida',
          `Agrega esta URL en Supabase → Auth → Redirect URLs:\n\n${redirectTo}`,
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

      {/* ── Orbs de fondo — teal vívido ────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />
        <View style={styles.orb4} />
        <View style={styles.orb5} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── Logo grande ─────────────────────────────────────── */}
        <Animated.View style={[styles.logoWrap, { opacity: logoAnim }]}>
          <VozpeLogo size="xxl" />
        </Animated.View>

        {/* ── Demo card ──────────────────────────────────────── */}
        <Animated.View
          style={[styles.demoCard, { opacity: heroAnim, transform: [{ translateY: heroY }] }]}
        >
          {/* Pill voz */}
          <Animated.View style={[styles.voicePill, { transform: [{ scale: card1S }] }]}>
            <View style={styles.voiceMicBadge}>
              <Mic size={14} color="#fff" strokeWidth={2.2} />
            </View>
            <Text style={styles.voicePillText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.voiceSparkle}>
              <Sparkles size={13} color="rgba(255,255,255,0.9)" />
            </View>
          </Animated.View>

          {/* Resultado */}
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

        {/* ── Method chips ───────────────────────────────────── */}
        <Animated.View style={[styles.chipsRow, { opacity: heroAnim }]}>
          {[
            { icon: Mic,     label: 'Voz',   bg: 'rgba(29,207,201,0.18)', border: 'rgba(29,207,201,0.45)', ic: TEAL       },
            { icon: Camera,  label: 'Foto',  bg: 'rgba(149,117,205,0.18)',border: 'rgba(149,117,205,0.45)',ic: PURPLE     },
            { icon: PenLine, label: 'Texto', bg: 'rgba(46,204,113,0.18)', border: 'rgba(46,204,113,0.45)', ic: GREEN_CHI  },
          ].map(({ icon: Icon, label, bg, border, ic }) => (
            <View key={label} style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
              <View style={[styles.chipIconWrap, { backgroundColor: ic + '30' }]}>
                <Icon size={15} color={ic} strokeWidth={2} />
              </View>
              <Text style={[styles.chipLabel, { color: ic }]}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Tagline ─────────────────────────────────────────── */}
        <Animated.View style={[styles.taglineWrap, { opacity: heroAnim }]}>
          <Text style={styles.tagline}>Anota ahora, ordena después.</Text>
          <Text style={styles.taglineSub}>
            Sin formularios, sin caos.{'\n'}Solo tú y tu grupo.
          </Text>
        </Animated.View>

        {/* ── Auth botones ────────────────────────────────────── */}
        <Animated.View
          style={[styles.authWrap, { opacity: ctaAnim, transform: [{ translateY: ctaY }] }]}
        >
          {/* Google — estilo oficial */}
          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={handleOAuth}
            activeOpacity={0.82}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator size="small" color="#5F6368" />
            ) : (
              <>
                <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
                <Text style={styles.btnGoogleText}>Iniciar sesión con Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Correo */}
          <TouchableOpacity
            style={styles.btnEmail}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.80}
          >
            <Mail size={18} color="#fff" strokeWidth={2} />
            <Text style={styles.btnEmailText}>Acceder con correo electrónico</Text>
          </TouchableOpacity>

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

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_BASE,
  },

  // ── Orbs ──────────────────────────────────────────────────────
  orb1: {
    position: 'absolute', width: 360, height: 360, borderRadius: 180,
    backgroundColor: TEAL_VIVID + '50',
    top: -140, right: -90,
  },
  orb2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: TEAL_SOFT + '60',
    top: 60, left: -110,
  },
  orb3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: TEAL_VIVID + '35',
    bottom: 260, right: -60,
  },
  orb4: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: TEAL_LIGHT + '70',
    bottom: 80, left: -70,
  },
  orb5: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: TEAL_SOFT + '40',
    bottom: 160, right: 20,
  },

  // ── Scroll ────────────────────────────────────────────────────
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 4,
    gap: 16,
  },

  // ── Logo ──────────────────────────────────────────────────────
  logoWrap: {
    alignItems: 'center',
    marginHorizontal: -22,
  },

  // ── Demo card ─────────────────────────────────────────────────
  demoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 22,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },

  voicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TEAL,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceMicBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  voicePillText: {
    flex: 1, color: '#fff',
    fontSize: 14, fontStyle: 'italic', fontWeight: '500',
  },
  voiceSparkle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },

  parsedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderLeftWidth: 3,
    borderColor: GREEN_CHI + '30',
    borderLeftColor: GREEN_CHI,
  },
  parsedIcon: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: '#F0FFFC',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#D5F5F0',
  },
  parsedEmoji:  { fontSize: 22 },
  parsedInfo:   { flex: 1, gap: 2 },
  parsedTitle:  { color: '#1A2A2A', fontSize: 15, fontWeight: '700' },
  parsedSub:    { color: '#5A7A78', fontSize: 11 },
  parsedRight:  { alignItems: 'flex-end', gap: 5 },
  parsedAmount: {
    color: '#1A2A2A', fontSize: 20, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
  perPersonBadge: {
    backgroundColor: TEAL + '22',
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: TEAL + '44',
  },
  perPersonText: { color: TEAL_DARK, fontSize: 10, fontWeight: '700' },

  // ── Chips ─────────────────────────────────────────────────────
  chipsRow: {
    flexDirection: 'row', gap: 8, width: '100%',
  },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    borderRadius: 999, paddingVertical: 10, borderWidth: 1.5,
  },
  chipIconWrap: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  chipLabel: { fontSize: 13, fontWeight: '700' },

  // ── Tagline ───────────────────────────────────────────────────
  taglineWrap: { alignItems: 'center', gap: 5 },
  tagline: {
    fontSize: 22, fontWeight: '800',
    color: '#0D3535',
    textAlign: 'center', letterSpacing: -0.5,
  },
  taglineSub: {
    fontSize: 13.5, color: '#2A6060',
    textAlign: 'center', lineHeight: 20,
  },

  // ── Auth ──────────────────────────────────────────────────────
  authWrap: { width: '100%', alignItems: 'center', gap: 11 },

  btnGoogle: {
    width: '100%', height: 54,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1.5, borderColor: '#DADCE0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  btnGoogleText: { color: '#3C4043', fontSize: 15, fontWeight: '600' },

  btnEmail: {
    width: '100%', height: 54,
    backgroundColor: TEAL,
    borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 6,
  },
  btnEmailText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  legal:     { color: '#2A6060', fontSize: 11, textAlign: 'center' },
  legalLink: { color: TEAL_DARK, fontWeight: '700' },
});
