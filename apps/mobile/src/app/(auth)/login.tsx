import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@vozpe/shared';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { VozpeLogo } from '../../components/common/VozpeLogo';

function getRedirectUrl(): string {
  // In Expo Go dev: use the stable EAS project URL (add this once to Supabase Redirect URLs)
  // In production: use the vozpe:// custom scheme
  if (__DEV__) {
    const url = 'exp://u.expo.dev/b393ec31-4e71-4cd6-b84b-cff6316aebaf';
    console.log('[OAuth] redirectTo (dev):', url);
    return url;
  }
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo (prod):', url);
  return url;
}

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [mode, setMode]                   = useState<Mode>('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [oauthLoading, setOauthLoading]   = useState<'google' | 'apple' | null>(null);
  const [emailFocused, setEmailFocused]   = useState(false);
  const [passFocused,  setPassFocused]    = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) Alert.alert('Error al iniciar sesión', error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          Alert.alert('Error', error.message);
        } else if (!data.session) {
          Alert.alert(
            'Confirma tu correo',
            `Te enviamos un email a ${email.trim()}. Confírmalo y luego inicia sesión.`,
            [{ text: 'OK', onPress: () => setMode('login') }]
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

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

      // PKCE flow: Supabase returns ?code= param, exchange it for a session
      const queryString = returnedUrl.includes('?') ? returnedUrl.split('?')[1] : '';
      const queryParams = Object.fromEntries(
        queryString.split('&').filter(Boolean).map(p => p.split('=').map(decodeURIComponent))
      );
      if (queryParams['code']) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryParams['code']);
        if (exchangeError) Alert.alert('Error', exchangeError.message);
        return;
      }

      // Implicit flow fallback: tokens in URL hash
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
          `No se pudo completar el inicio de sesión.\n\nAsegúrate de agregar esta URL en Supabase → Auth → Redirect URLs:\n${redirectTo}`,
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al iniciar sesión con Google');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Ingresa tu correo', 'Escribe tu correo arriba y luego toca "Olvidé mi contraseña".');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) throw error;
      Alert.alert(
        'Correo enviado',
        `Revisa tu bandeja en ${email.trim()} para restablecer tu contraseña.`,
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el correo.');
    }
  };

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Orbs de fondo */}
      <View style={styles.bgOrb} />
      <View style={styles.bgOrb2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <ChevronLeft size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <VozpeLogo size="xl" style={{ transform: [{ scale: 1.3 }] }} />
        </View>

        {/* Título */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Inicia sesión con tu cuenta'
              : 'Empieza a organizar gastos en grupo'}
          </Text>
        </View>

        {/* ── Formulario primero — es lo principal ── */}
        <View style={styles.formGroup}>
          <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
            <View style={styles.inputIconWrap}>
              <Mail size={16} color={emailFocused ? COLORS.vozpe500 : COLORS.textTertiary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={COLORS.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
            <View style={styles.inputIconWrap}>
              <Lock size={16} color={passFocused ? COLORS.vozpe500 : COLORS.textTertiary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword
                ? <EyeOff size={18} color={COLORS.textTertiary} />
                : <Eye    size={18} color={COLORS.textTertiary} />
              }
            </TouchableOpacity>
          </View>

          {/* Forgot password — solo en login */}
          {isLogin && (
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CTA principal */}
        <Button
          label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!email.trim() || !password}
          fullWidth
          size="lg"
        />

        {/* Separador */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Social Auth ── */}
        <View style={styles.socialGroup}>
          <TouchableOpacity
            style={styles.btnSocial}
            onPress={() => handleOAuth('google')}
            activeOpacity={0.80}
            disabled={!!oauthLoading}
            accessibilityRole="button"
            accessibilityLabel="Continuar con Google"
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <View style={styles.btnSocialInner}>
                <GoogleColorIcon size={20} />
                <Text style={styles.btnSocialText}>Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.btnSocial}
              onPress={() => handleOAuth('apple')}
              activeOpacity={0.80}
              disabled={!!oauthLoading}
              accessibilityRole="button"
              accessibilityLabel="Continuar con Apple"
            >
              {oauthLoading === 'apple' ? (
                <ActivityIndicator size="small" color={COLORS.textSecondary} />
              ) : (
                <View style={styles.btnSocialInner}>
                  <AppleIcon size={20} />
                  <Text style={styles.btnSocialText}>Apple</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Cambio de modo */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setMode(isLogin ? 'signup' : 'login')}
        >
          <Text style={styles.switchText}>
            {isLogin ? '¿Sin cuenta? ' : '¿Ya tienes cuenta? '}
            <Text style={styles.switchLink}>
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Al continuar aceptas los{' '}
          <Text style={styles.legalLink}>Términos</Text>
          {' '}y la{' '}
          <Text style={styles.legalLink}>Privacidad</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Ícono Google 4 colores reales ───────────────────────────────────────────
function GoogleColorIcon({ size = 22 }: { size?: number }) {
  const h = size / 2;
  const innerR = size * 0.27;
  const innerOffset = size * 0.5 - innerR;
  return (
    <View style={{ width: size, height: size, borderRadius: h, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, width: h, height: h, backgroundColor: '#4285F4' }} />
      <View style={{ position: 'absolute', right: 0, top: 0, width: h, height: h, backgroundColor: '#EA4335' }} />
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: h, height: h, backgroundColor: '#34A853' }} />
      <View style={{ position: 'absolute', right: 0, bottom: 0, width: h, height: h, backgroundColor: '#FBBC04' }} />
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

function AppleIcon({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.88, color: '#000', lineHeight: size * 1.05 }}>
        {'\uF8FF'}
      </Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    flex: 1, backgroundColor: COLORS.bgBase, overflow: 'hidden',
  },
  bgOrb: {
    position: 'absolute',
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: `${COLORS.vozpe500}12`,
    top: -150, right: -110,
  },
  bgOrb2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${COLORS.ai}0A`,
    bottom: 40, left: -60,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },

  // Logo
  logoWrap: { alignItems: 'center', paddingVertical: 36, marginBottom: 4 },

  // Scroll
  scroll: {
    paddingHorizontal: 22, paddingTop: 10, paddingBottom: 44, gap: 16,
  },

  // Título
  titleBlock: { gap: 4, marginBottom: 4 },
  title: {
    fontSize: 26, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 20,
  },

  // Form — ahora es lo primero que se ve
  formGroup: { gap: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderDefault,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: COLORS.vozpe500,
    backgroundColor: `${COLORS.vozpe500}07`,
  },
  inputIconWrap: { width: 20, alignItems: 'center' },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  // Forgot password
  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: { color: COLORS.vozpe400, fontSize: 13, fontWeight: '500' },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 12, fontWeight: '500' },

  // Social — ahora son botones compactos en fila
  socialGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSocial: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center', minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  btnSocialInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnSocialText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },

  // Cambio de modo
  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center' },
  switchLink: { color: COLORS.vozpe400, fontWeight: '600' },

  // Legal
  legal: { color: COLORS.textTertiary, fontSize: 11, textAlign: 'center' },
  legalLink: { color: COLORS.vozpe400 },
});
