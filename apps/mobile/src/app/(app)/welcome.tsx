import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, Table2, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { T } from '../../theme/tokens';

const TOUR_STEPS = [
  {
    icon: Mic,
    iconColor: T.blue,
    bgColor: T.blue + '18',
    title: 'Graba con tu voz',
    description: 'Di "Pizza 80 soles entre 4" y Vozpe lo registra automáticamente. Sin formularios, sin teclear.',
    emoji: '🎤',
  },
  {
    icon: Table2,
    iconColor: '#7C3AED',
    bgColor: '#7C3AED18',
    title: 'La sheet viva',
    description: 'Todas tus entradas se organizan solas en una tabla. Confirma, edita y filtra sin esfuerzo.',
    emoji: '📊',
  },
  {
    icon: Users,
    iconColor: T.green,
    bgColor: T.green + '18',
    title: 'Divide con tu grupo',
    description: 'Vozpe calcula automáticamente quién debe qué. Comparte el resumen por WhatsApp en un toque.',
    emoji: '🤝',
  },
];

export default function AppWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const current = TOUR_STEPS[step];
  const IconComponent = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await AsyncStorage.setItem('vozpe_tour_done', '1');
      router.back();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('vozpe_tour_done', '1');
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Blobs decorativos */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />

      {/* Skip button — solo en pasos 0 y 1 */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        {!isLast && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tour de Vozpe 👋</Text>
        <Text style={styles.headerSub}>3 cosas que debes saber</Text>
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>{current.emoji}</Text>

          <View style={[styles.iconCircle, { backgroundColor: current.bgColor }]}>
            <IconComponent size={28} color={current.iconColor} strokeWidth={2} />
          </View>

          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardDescription}>{current.description}</Text>
        </View>
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsRow}>
        {TOUR_STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === step
                ? { width: 24, backgroundColor: T.blue }
                : { width: 8, backgroundColor: T.strokeBlue },
            ]}
          />
        ))}
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleNext}
        activeOpacity={0.82}
      >
        <Text style={styles.btnPrimaryText}>
          {isLast ? '¡Listo!' : 'Siguiente →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.appBg,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  blob1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: T.blue + '0E',
    top: -120, right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.green + '0A',
    bottom: 60, left: -70,
  },

  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 8,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    color: T.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: T.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: T.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  cardWrap: {
    width: '100%',
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: T.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.strokeSoft,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...T.shadowCard,
    gap: 16,
  },
  cardEmoji: {
    fontSize: 40,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: T.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  cardDescription: {
    fontSize: 15,
    color: T.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  btnPrimary: {
    width: '100%',
    height: 56,
    backgroundColor: T.blue,
    borderRadius: T.rBtn,
    alignItems: 'center',
    justifyContent: 'center',
    ...T.shadowBtn,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
