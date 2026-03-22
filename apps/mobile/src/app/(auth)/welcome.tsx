import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, Table2, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@vozpe/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    icon: Mic,
    iconColor: COLORS.vozpe500,
    bgColor: `${COLORS.vozpe500}15`,
    title: 'Graba con tu voz',
    description: 'Di "Pizza 80 soles entre 4" y Vozpe lo registra automáticamente. Sin formularios, sin teclear.',
    emoji: '🎤',
  },
  {
    icon: Table2,
    iconColor: COLORS.ai,
    bgColor: `${COLORS.ai}15`,
    title: 'La sheet viva',
    description: 'Todas tus entradas se organizan solas en una tabla. Confirma, edita y filtra sin esfuerzo.',
    emoji: '📊',
  },
  {
    icon: Users,
    iconColor: COLORS.success,
    bgColor: `${COLORS.success}15`,
    title: 'Divide con tu grupo',
    description: 'Vozpe calcula automáticamente quién debe qué. Comparte el resumen por WhatsApp en un toque.',
    emoji: '🤝',
  },
];

async function finishTour(router: ReturnType<typeof useRouter>) {
  await AsyncStorage.setItem('vozpe_tour_done', '1');
  router.replace('/(app)');
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const current = TOUR_STEPS[step];
  const IconComponent = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await finishTour(router);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = async () => {
    await finishTour(router);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
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
        <Text style={styles.headerTitle}>Bienvenido a Vozpe 👋</Text>
        <Text style={styles.headerSub}>3 cosas que debes saber</Text>
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          {/* Emoji */}
          <Text style={styles.cardEmoji}>{current.emoji}</Text>

          {/* Ícono circular */}
          <View style={[styles.iconCircle, { backgroundColor: current.bgColor }]}>
            <IconComponent size={28} color={current.iconColor} strokeWidth={2} />
          </View>

          {/* Texto */}
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
                ? { width: 24, backgroundColor: COLORS.vozpe500 }
                : { width: 8, backgroundColor: COLORS.borderDefault },
            ]}
          />
        ))}
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={[styles.btnPrimary, isLast && styles.btnPrimaryLast]}
        onPress={handleNext}
        activeOpacity={0.82}
      >
        <Text style={styles.btnPrimaryText}>
          {isLast ? '¡Empecemos!' : 'Siguiente →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    paddingHorizontal: 24,
    alignItems: 'center',
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
    color: COLORS.textTertiary,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },

  cardWrap: {
    width: '100%',
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  cardDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.vozpe500,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.vozpe500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  btnPrimaryLast: {
    // Ya tiene estilos completos arriba — placeholder para extensión futura
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
