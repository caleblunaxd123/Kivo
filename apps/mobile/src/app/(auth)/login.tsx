import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock, Chrome } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@kivo/shared';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [mode, setMode]           = useState<Mode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
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

  const handleGoogle = async () => {
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
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) { subscription.remove(); Alert.alert('Error', error.message); return; }
    if (data?.url) await WebBrowser.openBrowserAsync(data.url);
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
        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Inicia sesión para continuar en Kivo'
              : 'Empieza a registrar gastos en grupo hoy'}
          </Text>
        </View>

        {/* Google OAuth */}
        <TouchableOpacity style={styles.oauthBtn} onPress={handleGoogle} activeOpacity={0.8}>
          <View style={styles.oauthIconWrap}>
            <Chrome size={18} color="#4285F4" />
          </View>
          <Text style={styles.oauthText}>Continuar con Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con correo</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email */}
        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
          <View style={styles.inputIconWrap}>
            <Mail size={16} color={emailFocused ? COLORS.kivo400 : COLORS.textTertiary} />
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

        {/* Password */}
        <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
          <View style={styles.inputIconWrap}>
            <Lock size={16} color={passFocused ? COLORS.kivo400 : COLORS.textTertiary} />
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

        {/* Submit */}
        <Button
          label={isLogin ? 'Iniciar sesión →' : 'Crear cuenta →'}
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
          {' '}y{' '}
          <Text style={styles.legalLink}>Privacidad</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    overflow: 'hidden',
  },
  bgOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: `${COLORS.kivo500}1A`,
    top: -160,
    right: -120,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  logoText: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  logoDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.kivo500,
    marginTop: -7,
  },

  // Scroll content
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 14,
  },

  // Title
  titleBlock: { gap: 6, marginBottom: 8 },
  title: {
    fontSize: 28, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15, color: COLORS.textSecondary, lineHeight: 22,
  },

  // OAuth
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18,
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  oauthIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  oauthText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 12, fontWeight: '500' },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: COLORS.kivo500,
    backgroundColor: `${COLORS.kivo500}08`,
  },
  inputIconWrap: { width: 20, alignItems: 'center' },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  // Switch
  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center' },
  switchLink: { color: COLORS.kivo400, fontWeight: '600' },

  // Legal
  legal: {
    color: COLORS.textTertiary, fontSize: 12, textAlign: 'center',
  },
  legalLink: { color: COLORS.kivo400 },
});
