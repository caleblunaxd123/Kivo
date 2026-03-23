import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft, User, Mail, Lock, Eye, EyeOff,
  Phone, Calendar, AlertCircle,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { VozpeLogo } from '../../components/common/VozpeLogo';
import { T } from '../../theme/tokens';

// ── Formateo automático de fecha DD/MM/AAAA ───────────────────────────────────
function formatBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Valida que la fecha sea real y la persona tenga entre 8 y 120 años
function validateBirthDate(dmy: string): string | null {
  const parts = dmy.split('/');
  if (parts.length !== 3 || parts[2].length < 4) return 'Ingresa la fecha completa (DD/MM/AAAA)';
  const [d, m, y] = parts.map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime()) || date.getDate() !== d || date.getMonth() + 1 !== m)
    return 'La fecha no es válida';
  const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 8)  return 'Debes tener al menos 8 años';
  if (age > 120) return 'Fecha de nacimiento no válida';
  return null;
}

// DD/MM/AAAA → YYYY-MM-DD para guardar en DB
function toISODate(dmy: string): string {
  const [d, m, y] = dmy.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [birthDate,   setBirthDate]   = useState('');
  const [phone,       setPhone]       = useState('');

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // foco de campos
  const [focus, setFocus] = useState<string | null>(null);
  const focused = (name: string) => focus === name;

  const emailRef     = useRef<TextInput>(null);
  const passRef      = useRef<TextInput>(null);
  const confirmRef   = useRef<TextInput>(null);
  const birthRef     = useRef<TextInput>(null);
  const phoneRef     = useRef<TextInput>(null);

  const handleBirthDateChange = (text: string) => {
    setBirthDate(formatBirthDate(text));
  };

  const handleSubmit = async () => {
    setError('');

    // ── Validaciones ──────────────────────────────────────────────────────
    if (!fullName.trim())
      return setError('Ingresa tu nombre completo.');
    if (fullName.trim().split(' ').length < 2)
      return setError('Ingresa tu nombre y apellido.');
    if (!EMAIL_REGEX.test(email.trim()))
      return setError('El correo electrónico no es válido.');
    if (password.length < 8)
      return setError('La contraseña debe tener al menos 8 caracteres.');
    if (password !== confirmPass)
      return setError('Las contraseñas no coinciden.');
    if (!birthDate || birthDate.length < 10)
      return setError('Ingresa tu fecha de nacimiento completa.');
    const birthErr = validateBirthDate(birthDate);
    if (birthErr) return setError(birthErr);

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name:  fullName.trim(),
            birth_date: toISODate(birthDate),
            phone:      phone.trim() || null,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Supabase envía un código de 6 dígitos al correo
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = fullName.trim() && email.trim() && password.length >= 8
    && confirmPass && birthDate.length === 10;

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Blobs decorativos */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />

      {/* Back */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <VozpeLogo size="xxl" />
        </View>

        {/* Título */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para empezar</Text>
        </View>

        {/* Error global */}
        {!!error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={T.errorRed} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Formulario ────────────────────────────────────────────────── */}
        <View style={styles.formGroup}>

          {/* Nombre completo */}
          <Field
            icon={<User size={16} color={focused('name') ? T.blue : T.textMuted} />}
            focused={focused('name')}
          >
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={T.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus(null)}
            />
          </Field>

          {/* Correo */}
          <Field
            icon={<Mail size={16} color={focused('email') ? T.blue : T.textMuted} />}
            focused={focused('email')}
          >
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={T.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus(null)}
            />
          </Field>

          {/* Contraseña */}
          <Field
            icon={<Lock size={16} color={focused('pass') ? T.blue : T.textMuted} />}
            focused={focused('pass')}
            right={
              <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPass
                  ? <EyeOff size={18} color={T.textMuted} />
                  : <Eye    size={18} color={T.textMuted} />
                }
              </TouchableOpacity>
            }
          >
            <TextInput
              ref={passRef}
              style={styles.input}
              placeholder="Contraseña (mín. 8 caracteres)"
              placeholderTextColor={T.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              onFocus={() => setFocus('pass')}
              onBlur={() => setFocus(null)}
            />
          </Field>

          {/* Confirmar contraseña */}
          <Field
            icon={<Lock size={16} color={focused('confirm') ? T.blue : T.textMuted} />}
            focused={focused('confirm')}
            right={
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showConfirm
                  ? <EyeOff size={18} color={T.textMuted} />
                  : <Eye    size={18} color={T.textMuted} />
                }
              </TouchableOpacity>
            }
          >
            <TextInput
              ref={confirmRef}
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={T.textMuted}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => birthRef.current?.focus()}
              onFocus={() => setFocus('confirm')}
              onBlur={() => setFocus(null)}
            />
          </Field>

          {/* Fecha de nacimiento */}
          <Field
            icon={<Calendar size={16} color={focused('birth') ? T.blue : T.textMuted} />}
            focused={focused('birth')}
            hint="DD/MM/AAAA"
          >
            <TextInput
              ref={birthRef}
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={T.textMuted}
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              onFocus={() => setFocus('birth')}
              onBlur={() => setFocus(null)}
            />
          </Field>

          {/* Teléfono (opcional) */}
          <Field
            icon={<Phone size={16} color={focused('phone') ? T.blue : T.textMuted} />}
            focused={focused('phone')}
            hint="Opcional"
          >
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor={T.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              onFocus={() => setFocus('phone')}
              onBlur={() => setFocus(null)}
            />
          </Field>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btnPrimary, (!canSubmit || loading) && styles.btnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.82}
          disabled={!canSubmit || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        {/* Switch a login */}
        <TouchableOpacity style={styles.switchBtn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.switchText}>
            {'¿Ya tienes cuenta? '}
            <Text style={styles.switchLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Al crear tu cuenta aceptas los{' '}
          <Text style={styles.legalLink}>Términos</Text>
          {' '}y la{' '}
          <Text style={styles.legalLink}>Privacidad</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ icon, focused, children, right, hint }: {
  icon: React.ReactNode;
  focused: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <View style={styles.inputIconWrap}>{icon}</View>
      {children}
      {hint && !right && <Text style={styles.fieldHint}>{hint}</Text>}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: T.appBg },

  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: T.blue + '0E', top: -120, right: -90,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.green + '0A', bottom: 60, left: -70,
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

  logoWrap: {
    alignItems: 'center', marginHorizontal: -22, marginTop: -30, marginBottom: -50,
  },

  scroll: { paddingHorizontal: 22, paddingTop: 8, gap: 14 },

  titleBlock: { gap: 4 },
  title: { fontSize: T.fs2xl, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.6 },
  subtitle: { fontSize: T.fsMd, color: T.textSecondary, lineHeight: 20 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF0F0', borderRadius: T.rCard,
    borderWidth: 1, borderColor: '#FECACA',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  errorText: { flex: 1, color: T.errorRed, fontSize: T.fsSm, lineHeight: 18 },

  formGroup: { gap: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.cardBg, borderRadius: T.rCard,
    borderWidth: 1, borderColor: T.strokeSoft,
    paddingHorizontal: T.spMd,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10, ...T.shadowXs,
  },
  inputWrapFocused: { borderColor: T.blue, backgroundColor: T.blueSoft },
  inputIconWrap: { width: 20, alignItems: 'center' },
  input: { flex: 1, color: T.textPrimary, fontSize: T.fsBase },
  fieldHint: { color: T.textMuted, fontSize: 11, fontWeight: '500' },

  btnPrimary: {
    width: '100%', height: 54,
    backgroundColor: T.blue, borderRadius: T.rBtn,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 6,
  },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: T.textMuted, fontSize: T.fsMd, textAlign: 'center' },
  switchLink: { color: T.blue, fontWeight: '700' },

  legal:     { color: T.textMuted, fontSize: T.fsXs, textAlign: 'center' },
  legalLink: { color: T.blue, fontWeight: '600' },
});
