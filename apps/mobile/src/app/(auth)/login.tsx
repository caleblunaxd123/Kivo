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
import { COLORS } from '@vozpe/shared';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { VozpeLogo } from '../../components/common/VozpeLogo';

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
        const at = params['access_token'];
        const rt = params['refresh_token'];
        if (at && rt) await supabase.auth.setSession({ access_token: at, refresh_token: rt });
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
      {/* Orb de fondo */}
      <View style={styles.bgOrb} />
      <View style={styles.bgOrb2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <VozpeLogo size="sm" />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Continúa donde lo dejaste'
              : 'Empieza a organizar gastos en grupo hoy'}
          </Text>
        </View>

        {/* ── Social Auth ── */}
        <View style={styles.socialGroup}>
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
        </View>

        {/* Separador */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con correo</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Formulario ── */}
        <View style={styles.formGroup}>
          <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
            <View style={styles.inputIconWrap}>
              <Mail size={15} color={emailFocused ? COLORS.vozpe500 : COLORS.textTertiary} />
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
              <Lock size={15} color={passFocused ? COLORS.vozpe500 : COLORS.textTertiary} />
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

        {/* CTA principal */}
        <Button
          label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!email.trim() || !password}
          fullWidth
          size="lg"
        />

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
      <Text style={{ fontSize: size * 0.82, color: '#000', lineHeight: size }}>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 22, paddingTop: 26, paddingBottom: 44, gap: 14,
  },

  // Título
  titleBlock: { gap: 5, marginBottom: 2 },
  title: {
    fontSize: 26, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 20,
  },

  // Social
  socialGroup: { gap: 10 },
  btnSocial: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 15, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center', minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  btnSocialInner: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  btnSocialText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 11, fontWeight: '500' },

  // Form
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
  inputIconWrap: { width: 18, alignItems: 'center' },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  // Cambio de modo
  switchBtn: { alignItems: 'center', paddingVertical: 3 },
  switchText: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center' },
  switchLink: { color: COLORS.vozpe400, fontWeight: '600' },

  // Legal
  legal: { color: COLORS.textTertiary, fontSize: 11, textAlign: 'center' },
  legalLink: { color: COLORS.vozpe400 },
});
