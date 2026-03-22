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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@vozpe/shared';

function getRedirectUrl(): string {
  // createURL genera exp://IP:PUERTO/ en dev y vozpe:// en producción.
  // Agrega exp://* en Supabase → Auth → URL Configuration → Redirect URLs.
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo:', url);
  return url;
}
import { supabase } from '../lib/supabase';
import { VozpeLogo } from '../components/common/VozpeLogo';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const ctaOpacity    = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
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
      if (result.type !== 'success' || !result.url) return;

      const returnedUrl = result.url;

      // PKCE flow: exchange code for session
      const queryString = returnedUrl.includes('?') ? returnedUrl.split('?')[1] : '';
      const queryParams = Object.fromEntries(
        queryString.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
      );
      if (queryParams['code']) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryParams['code']);
        if (exchangeError) Alert.alert('Error', exchangeError.message);
        return;
      }

      // Implicit flow fallback
      const hashPart = returnedUrl.includes('#') ? returnedUrl.split('#')[1] : '';
      const hashParams = Object.fromEntries(
        hashPart.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
      );
      const at = hashParams['access_token'];
      const rt = hashParams['refresh_token'];
      if (at && rt) {
        await supabase.auth.setSession({ access_token: at, refresh_token: rt });
      } else {
        Alert.alert(
          'Login con Google',
          `No se pudo completar.\n\nAgrega esta URL en Supabase → Auth → Redirect URLs:\n${redirectTo}`,
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al iniciar sesión');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Sección oscura — logo sobre fondo oscuro ── */}
      <View style={[styles.darkHeader, { height: WINDOW_HEIGHT * 0.46, paddingTop: insets.top + 20 }]}>
        <Animated.View style={{ opacity: logoOpacity, marginBottom: 4 }}>
          <VozpeLogo size="xxl" />
        </Animated.View>
        <Text style={styles.darkSubtitle}>Organiza tus gastos{'\n'}con tu voz</Text>
      </View>

      {/* ── Sección clara — auth buttons ── */}
      <Animated.View
        style={[
          styles.lightBody,
          { paddingBottom: insets.bottom + 14 },
          { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
        ]}
      >
        {/* Google */}
        <TouchableOpacity
          style={styles.btnGoogle}
          onPress={() => handleOAuth('google')}
          activeOpacity={0.80}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <>
              <GoogleColorIcon size={20} />
              <Text style={styles.btnGoogleText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.btnEmail}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.75}
        >
          <Mail size={18} color="#fff" />
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

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  // ── Sección oscura ───────────────────────────────────────────
  darkHeader: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  darkSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },

  // ── Sección clara ────────────────────────────────────────────
  lightBody: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },

  // ── Google button ────────────────────────────────────────────
  btnGoogle: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DADCE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  btnGoogleText: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Email button ─────────────────────────────────────────────
  btnEmail: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.vozpe500,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: COLORS.vozpe500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  btnEmailText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Legal ────────────────────────────────────────────────────
  legal: {
    color: COLORS.textTertiary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: -2,
  },
  legalLink: { color: COLORS.vozpe400 },
});
