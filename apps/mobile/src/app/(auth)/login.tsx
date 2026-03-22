import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { VozpeLogo } from '../../components/common/VozpeLogo';
import { T } from '../../theme/tokens';

function getRedirectUrl() {
  const url = Linking.createURL('/');
  console.log('[OAuth] redirectTo:', url);
  return url;
}

async function handleOAuthUrl(url: string): Promise<void> {
  console.log('[OAuth] handling URL:', url);

  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.['code'] as string | undefined;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) Alert.alert('Error al iniciar sesión', error.message);
    return;
  }

  const fragment = url.includes('#') ? url.split('#')[1] : '';
  const hashParams: Record<string, string> = {};
  fragment.split('&').filter(Boolean).forEach(p => {
    const idx = p.indexOf('=');
    if (idx > 0) hashParams[decodeURIComponent(p.slice(0, idx))] = decodeURIComponent(p.slice(idx + 1));
  });
  if (hashParams['access_token'] && hashParams['refresh_token']) {
    const { error } = await supabase.auth.setSession({
      access_token:  hashParams['access_token'],
      refresh_token: hashParams['refresh_token'],
    });
    if (error) Alert.alert('Error al iniciar sesión', error.message);
    return;
  }

  Alert.alert(
    'Configuración requerida',
    `Agrega esta URL en Supabase → Auth → Redirect URLs:\n\n${getRedirectUrl()}`,
    [{ text: 'OK' }],
  );
}

type Mode = 'login' | 'signup';

// ── Google G oficial 4 colores ────────────────────────────────────────────────
function GoogleGIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.88, color: '#000', lineHeight: size * 1.05 }}>
        {'\uF8FF'}
      </Text>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode]                 = useState<Mode>('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Correo inválido', 'Ingresa una dirección de correo electrónico válida.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(), password,
        });
        if (error) Alert.alert('Error al iniciar sesión', error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), password,
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
      console.log('[OAuth] result:', JSON.stringify(result));

      if (result.type === 'cancel' || result.type === 'dismiss') return;
      if (result.type !== 'success' || !result.url) return;

      await handleOAuthUrl(result.url);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al iniciar sesión');
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
      Alert.alert('Correo enviado', `Revisa tu bandeja en ${email.trim()}.`);
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
      {/* Blobs decorativos — azul/verde muy suaves */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />

      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 36 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <VozpeLogo size="xxl" />
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

        {/* Formulario */}
        <View style={styles.formGroup}>
          <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
            <View style={styles.inputIconWrap}>
              <Mail size={16} color={emailFocused ? T.blue : T.textMuted} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={T.textMuted}
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
              <Lock size={16} color={passFocused ? T.blue : T.textMuted} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={T.textMuted}
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
                ? <EyeOff size={18} color={T.textMuted} />
                : <Eye    size={18} color={T.textMuted} />
              }
            </TouchableOpacity>
          </View>

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

        {/* Social auth */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.btnSocial}
            onPress={() => handleOAuth('google')}
            activeOpacity={0.78}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google'
              ? <ActivityIndicator size="small" color={T.textMuted} />
              : <>
                  <GoogleGIcon size={20} />
                  <Text style={styles.btnSocialText}>Google</Text>
                </>
            }
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.btnSocial}
              onPress={() => handleOAuth('apple')}
              activeOpacity={0.78}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'apple'
                ? <ActivityIndicator size="small" color={T.textMuted} />
                : <>
                    <AppleIcon size={20} />
                    <Text style={styles.btnSocialText}>Apple</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Cambio de modo */}
        <TouchableOpacity style={styles.switchBtn} onPress={() => setMode(isLogin ? 'signup' : 'login')}>
          <Text style={styles.switchText}>
            {isLogin ? '¿Sin cuenta? ' : '¿Ya tienes cuenta? '}
            <Text style={styles.switchLink}>
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Al continuar aceptas los{' '}
          <Text style={styles.legalLink} onPress={() => Linking.openURL('https://vozpe.com/terminos')}>Términos</Text>
          {' '}y la{' '}
          <Text style={styles.legalLink} onPress={() => Linking.openURL('https://vozpe.com/privacidad')}>Privacidad</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: T.appBg },

  // Blobs decorativos — azul/verde muy suave, no intrusivos
  blob1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: T.blue + '0E',
    top: -120, right: -90,
  },
  blob2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.green + '0A',
    bottom: 60, left: -70,
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: T.spMd, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.cardBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft,
    ...T.shadowXs,
  },

  logoWrap: {
    alignItems: 'center',
    marginHorizontal: -22,
    marginTop: -30, marginBottom: -50,
  },

  scroll: { paddingHorizontal: 22, paddingTop: 8, gap: 16 },

  titleBlock: { gap: 4 },
  title: {
    fontSize: T.fs2xl, fontWeight: '800',
    color: T.textPrimary, letterSpacing: -0.6,
  },
  subtitle: { fontSize: T.fsMd, color: T.textSecondary, lineHeight: 20 },

  // ── Form ──────────────────────────────────────────────────────────────────
  formGroup: { gap: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.cardBg,
    borderRadius: T.rCard,
    borderWidth: 1, borderColor: T.strokeSoft,
    paddingHorizontal: T.spMd,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
    ...T.shadowXs,
  },
  inputWrapFocused: {
    borderColor: T.blue,
    backgroundColor: T.blueSoft,
  },
  inputIconWrap: { width: 20, alignItems: 'center' },
  input: { flex: 1, color: T.textPrimary, fontSize: T.fsBase },

  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: { color: T.blue, fontSize: T.fsSm, fontWeight: '600' },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.strokeSoft },
  dividerText: { color: T.textMuted, fontSize: T.fsSm, fontWeight: '500' },

  // ── Social ────────────────────────────────────────────────────────────────
  socialRow: { flexDirection: 'row', gap: 10 },
  btnSocial: {
    flex: 1,
    backgroundColor: T.cardBg,
    borderRadius: T.rCard,
    paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1, borderColor: T.strokeSoft,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row', gap: 8,
    ...T.shadowXs,
  },
  btnSocialText: { color: T.textPrimary, fontSize: T.fsMd, fontWeight: '600' },

  // ── Switch / Legal ────────────────────────────────────────────────────────
  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: T.textMuted, fontSize: T.fsMd, textAlign: 'center' },
  switchLink: { color: T.blue, fontWeight: '700' },

  legal:     { color: T.textMuted, fontSize: T.fsXs, textAlign: 'center' },
  legalLink: { color: T.blue, fontWeight: '600' },
});
