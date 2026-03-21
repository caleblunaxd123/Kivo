import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@kivo/shared';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [mode, setMode]                   = useState<Mode>('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
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

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background orb */}
      <View style={styles.bgOrb} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>kivo</Text>
          <View style={styles.logoDot} />
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Inicia sesión para continuar'
              : 'Empieza a organizar gastos en grupo'}
          </Text>
        </View>

        {/* ── Social Auth ── */}
        <View style={styles.socialGroup}>
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
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con correo</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Email form ── */}
        <View style={styles.formGroup}>
          <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
            <View style={styles.inputIconWrap}>
              <Mail size={15} color={emailFocused ? COLORS.kivo400 : COLORS.textTertiary} />
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
              <Lock size={15} color={passFocused ? COLORS.kivo400 : COLORS.textTertiary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
          </View>
        </View>

        {/* Submit */}
        <Button
          label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!email.trim() || !password}
          fullWidth
          size="lg"
        />

        {/* Switch mode */}
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

// ── Icon helpers ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <View style={iconStyles.wrap}>
      <Text style={iconStyles.g}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={iconStyles.wrap}>
      <Text style={iconStyles.apple}></Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  g: {
    fontSize: 15, fontWeight: '700', color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  apple: { fontSize: 17, color: '#000', lineHeight: 20 },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    overflow: 'hidden',
  },
  bgOrb: {
    position: 'absolute',
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: `${COLORS.kivo500}14`,
    top: -160, right: -130,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  logoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.borderAccent,
  },
  logoText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  logoDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.kivo500, marginTop: -7,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 14,
  },

  // Title
  titleBlock: { gap: 5, marginBottom: 4 },
  title: {
    fontSize: 26, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 20,
  },

  // Social auth
  socialGroup: { gap: 9 },
  btnSocial: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center', minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  btnSocialInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnSocialText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 11, fontWeight: '500' },

  // Form
  formGroup: { gap: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderDefault,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: COLORS.kivo500,
    backgroundColor: `${COLORS.kivo500}07`,
  },
  inputIconWrap: { width: 18, alignItems: 'center' },
  input: {
    flex: 1, color: COLORS.textPrimary, fontSize: 15,
  },

  // Switch
  switchBtn: { alignItems: 'center', paddingVertical: 2 },
  switchText: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center' },
  switchLink: { color: COLORS.kivo400, fontWeight: '600' },

  // Legal
  legal: { color: COLORS.textTertiary, fontSize: 11, textAlign: 'center' },
  legalLink: { color: COLORS.kivo400 },
});
