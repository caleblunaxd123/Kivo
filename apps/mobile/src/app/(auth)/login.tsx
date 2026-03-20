import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS } from '@kivo/shared';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: 'kivo://' },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  };

  const handleGoogle = async () => {
    const redirectTo = Linking.createURL('/');

    // Listen for the deep link BEFORE opening the browser
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

    if (error) {
      subscription.remove();
      Alert.alert('Error', error.message);
      return;
    }

    if (data?.url) {
      await WebBrowser.openBrowserAsync(data.url);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.logoText}>kivo</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {sent ? (
          <View style={styles.sentContainer}>
            <Text style={styles.sentEmoji}>✉️</Text>
            <Text style={styles.sentTitle}>Revisa tu correo</Text>
            <Text style={styles.sentSub}>
              Enviamos un enlace mágico a{'\n'}
              <Text style={{ color: COLORS.kivo400 }}>{email}</Text>
            </Text>
            <Button
              label="Reenviar enlace"
              onPress={handleMagicLink}
              variant="secondary"
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Bienvenido a Kivo</Text>
            <Text style={styles.subtitle}>Tu workspace colaborativo</Text>

            {/* OAuth */}
            <TouchableOpacity style={styles.oauthBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={styles.oauthIcon}>G</Text>
              <Text style={styles.oauthText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o con correo</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="send"
                onSubmitEditing={handleMagicLink}
              />
            </View>

            <Button
              label="Continuar →"
              onPress={handleMagicLink}
              loading={loading}
              disabled={!email.trim()}
              fullWidth
              size="lg"
              style={{ marginTop: 4 }}
            />

            <Text style={styles.legal}>
              Al continuar aceptas los{' '}
              <Text style={styles.legalLink}>Términos</Text> y{' '}
              <Text style={styles.legalLink}>Privacidad</Text>
            </Text>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
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
  },
  logoText: {
    fontSize: 20, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 14,
  },
  title: {
    fontSize: 28, fontWeight: '700',
    color: COLORS.textPrimary, letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16, color: COLORS.textSecondary, marginTop: -6,
  },
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    marginTop: 8,
  },
  oauthIcon: {
    fontSize: 16, fontWeight: '800',
    color: '#4285F4', width: 20, textAlign: 'center',
  },
  oauthText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { color: COLORS.textTertiary, fontSize: 13 },
  inputGroup: { gap: 6 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  legal: { color: COLORS.textTertiary, fontSize: 12, textAlign: 'center', marginTop: 8 },
  legalLink: { color: COLORS.kivo400 },
  // Sent state
  sentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  sentEmoji: { fontSize: 56 },
  sentTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  sentSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});
