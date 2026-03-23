import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, PenLine, Mic, Mail, Sparkles } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { VozpeLogo } from '../components/common/VozpeLogo';
import { T } from '../theme/tokens';

const { width: SW } = Dimensions.get('window');

function getRedirectUrl() {
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo:', url);
  return url;
}

/** Extrae el code/tokens de la URL de retorno OAuth y los intercambia con Supabase */
async function handleOAuthUrl(url: string): Promise<void> {
  console.log('[OAuth] handling URL:', url.substring(0, 80) + '...');

  // PKCE: code en query params
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.['code'] as string | undefined;
  if (code) {
    console.log('[OAuth] PKCE flow — exchangeCodeForSession');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[OAuth] exchangeCodeForSession error:', error.message);
      Alert.alert('Error al iniciar sesión', error.message);
    }
    return;
  }

  // Implicit flow: tokens en el fragmento #
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  const hashParams: Record<string, string> = {};
  fragment.split('&').filter(Boolean).forEach(p => {
    const idx = p.indexOf('=');
    if (idx > 0) hashParams[decodeURIComponent(p.slice(0, idx))] = decodeURIComponent(p.slice(idx + 1));
  });

  if (hashParams['access_token'] && hashParams['refresh_token']) {
    console.log('[OAuth] Implicit flow — setSession');
    const { error, data } = await supabase.auth.setSession({
      access_token:  hashParams['access_token'],
      refresh_token: hashParams['refresh_token'],
    });
    if (error) {
      console.error('[OAuth] setSession error:', error.message);
      Alert.alert('Error al iniciar sesión', error.message);
    } else {
      console.log('[OAuth] setSession OK — user:', data.session?.user?.email);
    }
    return;
  }

  // Sin tokens → redirect URL no registrada en Supabase
  Alert.alert(
    'Configuración requerida',
    `Agrega esta URL en Supabase → Auth → Redirect URLs:\n\n${getRedirectUrl()}`,
    [{ text: 'OK' }],
  );
}

// ── Google G oficial (4 colores, SVG) ────────────────────────────────────────
function GoogleGIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  // ── Animaciones — todos los refs ANTES de cualquier return condicional ──
  const logoAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentY    = useRef(new Animated.Value(20)).current;
  const ctaAnim     = useRef(new Animated.Value(0)).current;
  const ctaY        = useRef(new Animated.Value(12)).current;
  const card1S      = useRef(new Animated.Value(0.94)).current;
  const card2S      = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(40),
      Animated.parallel([
        Animated.timing(contentAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(contentY,    { toValue: 0, duration: 480, useNativeDriver: true }),
        Animated.spring(card1S,      { toValue: 1, useNativeDriver: true }),
        Animated.spring(card2S,      { toValue: 1, damping: 10, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(ctaAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(ctaY,    { toValue: 0, duration: 360, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // ── Android OAuth fix: Linking listener captura el redirect aunque
  //    openAuthSessionAsync devuelva 'cancel' (comportamiento normal en Android
  //    con Chrome Custom Tabs — la URL llega por el sistema de deep links) ──
  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      console.log('[OAuth] Linking event URL:', url);
      if (url.includes('code=') || url.includes('access_token=')) {
        await handleOAuthUrl(url);
        setOauthLoading(null);
      }
    });

    // App abierta directamente desde el redirect OAuth (cold start)
    Linking.getInitialURL().then(url => {
      if (url && (url.includes('code=') || url.includes('access_token='))) {
        console.log('[OAuth] initial URL:', url);
        handleOAuthUrl(url).then(() => setOauthLoading(null));
      }
    });

    return () => sub.remove();
  }, []);

  // ── Guard de auth — DESPUÉS de todos los hooks ──────────────────────────
  if (isAuthenticated) return <Redirect href="/(app)" />;

  const isAuthenticating = useRef(false);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    setOauthLoading(provider);

    try {
      const redirectTo = getRedirectUrl().replace('vozpe://', 'kivo://');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { Alert.alert('Error al iniciar sesión', error.message); return; }
      if (!data?.url) { Alert.alert('Error', 'No se pudo obtener la URL de autenticación.'); return; }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('[OAuth] openAuthSessionAsync result:', JSON.stringify(result));

      if (result.type === 'success' && result.url) {
        await handleOAuthUrl(result.url);
      } else {
        setOauthLoading(null);
        isAuthenticating.current = false;
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? `Error al iniciar sesión con ${provider}.`);
      setOauthLoading(null);
      isAuthenticating.current = false;
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Blobs decorativos ─────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />
        <View style={styles.blob4} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Logo ─────────────────────────────────────────────────── */}
        {/* PNG 1536×1024 ratio 1.5 → height>262 → renders width-constrained en SW×262 */}
        <Animated.View style={[styles.logoWrap, { opacity: logoAnim }]}>
          <VozpeLogo size="xxl" />
        </Animated.View>

        {/* ── Demo hero card ────────────────────────────────────────── */}
        <Animated.View
          style={[styles.heroCard, {
            opacity: contentAnim,
            transform: [{ translateY: contentY }],
          }]}
        >
          {/* Voz input pill */}
          <Animated.View style={[styles.voicePill, { transform: [{ scale: card1S }] }]}>
            <View style={styles.voiceMicBadge}>
              <Mic size={15} color="#fff" strokeWidth={2.2} />
            </View>
            <Text style={styles.voicePillText}>"Taxi 40 dólares, entre 4"</Text>
            <View style={styles.sparkleWrap}>
              <Sparkles size={13} color="rgba(255,255,255,0.9)" />
            </View>
          </Animated.View>

          {/* Label interpretación */}
          <Text style={styles.vozpeUnderstandsLabel}>Vozpe entiende</Text>

          {/* Parsed result */}
          <Animated.View style={[styles.parsedRow, { transform: [{ scale: card2S }] }]}>
            <View style={styles.parsedIconBox}>
              <Text style={styles.parsedEmoji}>🚗</Text>
            </View>
            <View style={styles.parsedInfo}>
              <Text style={styles.parsedTitle}>Taxi</Text>
              <Text style={styles.parsedSub}>División igual · 4 personas</Text>
            </View>
            <View style={styles.parsedRight}>
              <Text style={styles.parsedAmount}>$40,00</Text>
              <View style={styles.perPersonChip}>
                <Text style={styles.perPersonText}>$10 c/u</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── Method chips ──────────────────────────────────────────── */}
        <Animated.View style={[styles.chipsRow, { opacity: contentAnim }]}>
          {[
            { Icon: Mic,     label: 'Voz',   bg: T.softBlueBg, border: T.strokeBlue,  iconBg: T.blue + '18',  ic: T.blue  },
            { Icon: Camera,  label: 'Foto',  bg: '#EDF4FF',    border: '#C5D8F8',     iconBg: T.blue + '12',  ic: '#3B82F6' },
            { Icon: PenLine, label: 'Texto', bg: T.softMintBg, border: T.strokeGreen, iconBg: T.green + '18', ic: T.green },
          ].map(({ Icon, label, bg, border, iconBg, ic }) => (
            <View key={label} style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
              <View style={[styles.chipIconWrap, { backgroundColor: iconBg }]}>
                <Icon size={14} color={ic} strokeWidth={2.1} />
              </View>
              <Text style={[styles.chipLabel, { color: ic }]}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Tagline ───────────────────────────────────────────────── */}
        <Animated.View style={[styles.taglineWrap, { opacity: contentAnim }]}>
          <Text style={styles.tagline}>Anota ahora, ordena después.</Text>
          <Text style={styles.taglineSub}>
            Sin formularios, sin caos.{'\n'}Solo tú y tu grupo.
          </Text>
        </Animated.View>

        {/* ── Auth buttons ─────────────────────────────────────────── */}
        <Animated.View style={[styles.authWrap, {
          opacity: ctaAnim,
          transform: [{ translateY: ctaY }],
        }]}>

          {/* Google */}
          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={() => handleOAuth('google')}
            activeOpacity={0.8}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google'
              ? <ActivityIndicator size="small" color="#5F6368" />
              : <>
                  <GoogleGIcon size={22} />
                  <Text style={styles.btnGoogleText}>Continuar con Google</Text>
                </>
            }
          </TouchableOpacity>

          {/* Apple — solo iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.btnApple}
              onPress={() => handleOAuth('apple')}
              activeOpacity={0.8}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'apple'
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Text style={styles.btnAppleIcon}></Text>
                    <Text style={styles.btnAppleText}>Continuar con Apple</Text>
                  </>
              }
            </TouchableOpacity>
          )}

          {/* Email */}
          <TouchableOpacity
            style={styles.btnEmail}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.82}
            disabled={!!oauthLoading}
          >
            <Mail size={17} color="#fff" strokeWidth={2} />
            <Text style={styles.btnEmailText}>Acceder con correo electrónico</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Al continuar aceptas los{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://vozpe.com/terminos')}>Términos</Text>
            {' '}y la{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://vozpe.com/privacidad')}>Privacidad</Text>.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.appBg },

  // ── Blobs ─────────────────────────────────────────────────────────────────
  blob1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: T.blue + '12',
    top: -130, right: -90,
  },
  blob2: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: T.green + '0E',
    top: 80, left: -100,
  },
  blob3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.blue + '0C',
    bottom: 200, right: -60,
  },
  blob4: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: T.green + '0A',
    bottom: 40, left: -80,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  // PNG 1536×1024 (ratio 1.5) — height:300 > SW/1.5≈262 → image renders width-constrained
  // a SW×262. Márgenes negativos recortan espacio transparente del PNG.
  logoWrap: {
    width: SW,
    alignItems: 'center',
    marginHorizontal: -20,
    marginTop: -50,
    marginBottom: -60,
  },

  // ── Hero demo card ────────────────────────────────────────────────────────
  heroCard: {
    width: '100%',
    backgroundColor: T.cardBg,
    borderRadius: T.rCardLg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: T.strokeSoft,
    ...T.shadowCard,
  },

  voicePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.blue,
    borderRadius: T.rChip,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  voiceMicBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  voicePillText: {
    flex: 1, color: '#fff', fontSize: 14, fontStyle: 'italic', fontWeight: '500',
    letterSpacing: 0.1,
  },
  sparkleWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  vozpeUnderstandsLabel: {
    textAlign: 'center',
    fontSize: 11, fontWeight: '600',
    color: T.textMuted, letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  parsedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.softMintBg,
    borderRadius: T.rCard,
    padding: 13,
    borderWidth: 1, borderLeftWidth: 3,
    borderColor: T.strokeGreen,
    borderLeftColor: T.green,
  },
  parsedIconBox: {
    width: 44, height: 44, borderRadius: T.rIcon,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeGreen,
  },
  parsedEmoji:  { fontSize: 22 },
  parsedInfo:   { flex: 1, gap: 3 },
  parsedTitle:  { color: T.textPrimary, fontSize: 15, fontWeight: '700' },
  parsedSub:    { color: T.textSecondary, fontSize: 11.5 },
  parsedRight:  { alignItems: 'flex-end', gap: 6 },
  parsedAmount: {
    color: T.textPrimary, fontSize: 20, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
  perPersonChip: {
    backgroundColor: T.green + '1A',
    borderRadius: T.rChip, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: T.green + '40',
  },
  perPersonText: { color: T.greenDeep, fontSize: 10.5, fontWeight: '700' },

  // ── Method chips ──────────────────────────────────────────────────────────
  chipsRow: { flexDirection: 'row', gap: 8, width: '100%' },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: T.rChip, paddingVertical: 11,
    borderWidth: 1.5,
  },
  chipIconWrap: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  chipLabel: { fontSize: 13, fontWeight: '700' },

  // ── Tagline ───────────────────────────────────────────────────────────────
  taglineWrap: { alignItems: 'center', gap: 6 },
  tagline: {
    fontSize: 22, fontWeight: '800',
    color: T.textPrimary, textAlign: 'center', letterSpacing: -0.5,
  },
  taglineSub: {
    fontSize: 13.5, color: T.textSecondary,
    textAlign: 'center', lineHeight: 21,
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  authWrap: { width: '100%', gap: 10, alignItems: 'center' },

  btnGoogle: {
    width: '100%', height: 54,
    backgroundColor: '#fff',
    borderRadius: T.rBtn,
    borderWidth: 1.5, borderColor: '#DADCE0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  btnGoogleText: { color: '#3C4043', fontSize: 15, fontWeight: '600' },

  btnApple: {
    width: '100%', height: 54,
    backgroundColor: '#000',
    borderRadius: T.rBtn,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  btnAppleIcon: { fontSize: 20, color: '#fff', lineHeight: 26 },
  btnAppleText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  btnEmail: {
    width: '100%', height: 54,
    backgroundColor: T.green,
    borderRadius: T.rBtn,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: T.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.36, shadowRadius: 16, elevation: 7,
  },
  btnEmailText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  legal:     { color: T.textMuted, fontSize: 11.5, textAlign: 'center' },
  legalLink: { color: T.blue, fontWeight: '700' },
});
