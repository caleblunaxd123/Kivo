import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, CheckCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { T } from '../../theme/tokens';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [digits, setDigits]       = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

  // Cuenta regresiva para reenviar
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');

    // Pegar código completo
    if (cleaned.length === CODE_LENGTH) {
      const newDigits = cleaned.split('');
      setDigits(newDigits);
      inputs.current[CODE_LENGTH - 1]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const token = digits.join('');
    if (token.length < CODE_LENGTH) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }
    if (!email) {
      setError('No se encontró el correo. Vuelve a intentarlo.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (verifyError) {
        setError(
          verifyError.message.includes('expired')
            ? 'El código expiró. Solicita uno nuevo.'
            : verifyError.message.includes('invalid')
            ? 'Código incorrecto. Revisa tu correo.'
            : verifyError.message,
        );
        return;
      }

      setSuccess(true);
      // El auth store detecta SIGNED_IN y navega automáticamente a /(app)
    } catch (e: any) {
      setError(e?.message ?? 'Error al verificar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setResending(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) {
        setError('No se pudo reenviar el código. Intenta más tarde.');
      } else {
        setCountdown(60);
        setCanResend(false);
        setDigits(Array(CODE_LENGTH).fill(''));
        inputs.current[0]?.focus();
      }
    } catch {
      setError('Error al reenviar. Intenta más tarde.');
    } finally {
      setResending(false);
    }
  };

  const codeComplete = digits.every(d => d !== '');

  if (success) {
    return (
      <View style={[styles.successWrap, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <CheckCircle size={64} color={T.green} strokeWidth={1.5} />
        </View>
        <Text style={styles.successTitle}>¡Cuenta verificada!</Text>
        <Text style={styles.successSub}>Entrando a la app...</Text>
        <ActivityIndicator color={T.blue} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Blobs */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />

      {/* Back */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/signup')}>
          <ChevronLeft size={20} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Icono de correo */}
        <View style={styles.mailIconWrap}>
          <View style={styles.mailIconBg}>
            <Mail size={36} color={T.blue} strokeWidth={1.5} />
          </View>
        </View>

        {/* Textos */}
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Enviamos un código de 6 dígitos a{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* Cajas OTP */}
        <View style={styles.otpRow}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { inputs.current[i] = el; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : undefined,
                i === digits.findIndex(d => d === '') && styles.otpBoxActive,
              ]}
              value={digit}
              onChangeText={text => handleDigitChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="numeric"
              maxLength={CODE_LENGTH} // permite pegar el código completo
              selectTextOnFocus
              textAlign="center"
              caretHidden={false}
            />
          ))}
        </View>

        {/* Error */}
        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Botón verificar */}
        <TouchableOpacity
          style={[styles.btnVerify, (!codeComplete || loading) && styles.btnDisabled]}
          onPress={handleVerify}
          activeOpacity={0.82}
          disabled={!codeComplete || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnVerifyText}>Verificar código</Text>
          }
        </TouchableOpacity>

        {/* Reenviar */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>¿No recibiste el código?</Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending
                ? <ActivityIndicator size="small" color={T.blue} />
                : <Text style={styles.resendLink}>Reenviar código</Text>
              }
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCountdown}>
              Reenviar en <Text style={styles.resendCountdownBold}>{countdown}s</Text>
            </Text>
          )}
        </View>

        <Text style={styles.hint}>
          Revisa también tu carpeta de spam si no lo encuentras.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: T.appBg },

  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: T.blue + '0E', top: -100, right: -80,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.green + '0A', bottom: 100, left: -60,
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: T.spMd, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.cardBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft, ...T.shadowXs,
  },

  content: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: 28, paddingTop: 20, gap: 16,
  },

  mailIconWrap: { marginBottom: 4 },
  mailIconBg: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: T.softBlueBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeBlue,
  },

  title: {
    fontSize: T.fs2xl, fontWeight: '800',
    color: T.textPrimary, textAlign: 'center', letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: T.fsMd, color: T.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  emailHighlight: { color: T.blue, fontWeight: '700' },

  // ── OTP boxes ─────────────────────────────────────────────────────────────
  otpRow: {
    flexDirection: 'row', gap: 10, marginVertical: 8,
  },
  otpBox: {
    width: 46, height: 56, borderRadius: 14,
    backgroundColor: T.cardBg,
    borderWidth: 1.5, borderColor: T.strokeSoft,
    fontSize: 24, fontWeight: '700', color: T.textPrimary,
    ...T.shadowXs,
  },
  otpBoxFilled: {
    borderColor: T.blue,
    backgroundColor: T.softBlueBg,
  },
  otpBoxActive: {
    borderColor: T.blue + '80',
  },

  errorText: {
    color: T.errorRed, fontSize: T.fsSm, textAlign: 'center',
    backgroundColor: '#FFF0F0', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: T.rCard, borderWidth: 1, borderColor: '#FECACA',
    width: '100%',
  },

  btnVerify: {
    width: '100%', height: 54,
    backgroundColor: T.blue, borderRadius: T.rBtn,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 6,
  },
  btnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  btnVerifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resendLabel: { color: T.textMuted, fontSize: T.fsSm },
  resendLink: { color: T.blue, fontSize: T.fsSm, fontWeight: '700' },
  resendCountdown: { color: T.textMuted, fontSize: T.fsSm },
  resendCountdownBold: { color: T.textPrimary, fontWeight: '700' },

  hint: {
    color: T.textMuted, fontSize: 11.5, textAlign: 'center',
    paddingHorizontal: 16, lineHeight: 17,
  },

  // ── Success state ─────────────────────────────────────────────────────────
  successWrap: {
    flex: 1, backgroundColor: T.appBg,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  successIcon: {
    width: 120, height: 120, borderRadius: 36,
    backgroundColor: T.softMintBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeGreen,
  },
  successTitle: { fontSize: T.fs2xl, fontWeight: '800', color: T.textPrimary },
  successSub:   { fontSize: T.fsMd, color: T.textSecondary },
});
