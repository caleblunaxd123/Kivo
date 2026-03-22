import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus, Bell, TrendingUp, Layers, ChevronRight,
  HelpCircle, Sparkles, Mail, X,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency, GROUP_TYPE_CONFIG, generateInitials } from '@vozpe/shared';
import type { Group } from '@vozpe/shared';
import { useGroupStore } from '../../stores/group.store';
import { useAuthStore } from '../../stores/auth.store';
import { EmptyState } from '../../components/common/EmptyState';
import { AvatarGroup } from '../../components/common/Avatar';
import { T } from '../../theme/tokens';

export default function GroupsHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user   = useAuthStore(s => s.user);
  const { groups, isLoadingGroups, fetchGroups } = useGroupStore();
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    fetchGroups();
    AsyncStorage.getItem('vozpe_tour_done').then(done => {
      if (!done) router.replace('/(auth)/welcome');
    });
  }, []);

  const onRefresh = useCallback(() => { fetchGroups(); }, []);

  const uniqueCurrencies  = [...new Set(groups.map(g => g.baseCurrency))];
  const singleCurrency    = uniqueCurrencies.length === 1 ? uniqueCurrencies[0] : null;
  const totalAcrossGroups = singleCurrency
    ? groups.reduce((sum, g) => sum + (g.totalAmount ?? 0), 0)
    : 0;

  const firstName   = user?.displayName?.split(' ')[0] ?? 'ahí';
  const initials    = generateInitials(user?.displayName ?? 'K');
  const avatarColor = user?.colorHex ?? T.blue;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Blobs decorativos */}
        <View style={styles.headerBlob1} pointerEvents="none" />
        <View style={styles.headerBlob2} pointerEvents="none" />

        {/* Fila superior */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.greetingSmall}>{greeting}</Text>
              <Text style={styles.greetingName}>{firstName} 👋</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Alert.alert('Próximamente', 'Las notificaciones estarán disponibles en la próxima versión.')}
            >
              <Bell size={17} color={T.textSecondary} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setHelpVisible(true)}>
              <HelpCircle size={17} color={T.textSecondary} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {groups.length > 0 && (
          <View style={styles.statsRow}>
            {/* Card grupos activos */}
            <View style={styles.statCardWhite}>
              <View style={[styles.statIconBox, { backgroundColor: T.blue + '14' }]}>
                <Layers size={15} color={T.blue} strokeWidth={1.8} />
              </View>
              <View style={styles.statTexts}>
                <Text style={styles.statValue}>{groups.length}</Text>
                <Text style={styles.statLabel}>grupos activos</Text>
              </View>
            </View>

            {/* Card total — gradiente azul→verde */}
            <View style={styles.statCardAccent}>
              <View style={styles.statBlobAccent} pointerEvents="none" />
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <TrendingUp size={15} color="#fff" strokeWidth={2} />
              </View>
              <View style={styles.statTexts}>
                <Text style={styles.statValueAccent} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {singleCurrency
                    ? formatCurrency(totalAcrossGroups, singleCurrency)
                    : 'Multi-moneda'}
                </Text>
                <Text style={styles.statLabelAccent}>total registrado</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {groups.length > 0 ? 'Tus grupos' : 'Empieza aquí'}
        </Text>
      </View>

      {/* ── Lista de grupos ─────────────────────────────────────── */}
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        contentContainerStyle={groups.length === 0 ? styles.emptyWrap : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingGroups}
            onRefresh={onRefresh}
            tintColor={T.blue}
          />
        }
        ListEmptyComponent={
          !isLoadingGroups ? (
            <EmptyState
              emoji="✨"
              title="Tu primer grupo te espera"
              subtitle="Crea uno para organizar un viaje, compras, eventos o lo que necesites."
              ctaLabel="Crear grupo"
              onCta={() => router.push('/(app)/group/create')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <GroupCard group={item} onPress={() => router.push(`/(app)/group/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* ── FAB ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 76 }]}
        onPress={() => router.push('/(app)/group/create')}
        activeOpacity={0.85}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── Modal de ayuda ─────────────────────────────────────── */}
      <Modal visible={helpVisible} transparent animationType="slide" onRequestClose={() => setHelpVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setHelpVisible(false)} />
        <View style={[styles.helpSheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>¿Necesitas ayuda?</Text>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setHelpVisible(false)}>
              <X size={16} color={T.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.helpOption} onPress={() => { setHelpVisible(false); router.push('/(auth)/welcome'); }}>
            <View style={[styles.helpIconBox, { backgroundColor: T.blue + '14' }]}>
              <Sparkles size={20} color={T.blue} />
            </View>
            <View style={styles.helpTextCol}>
              <Text style={styles.helpOptionTitle}>Ver tour de la app</Text>
              <Text style={styles.helpOptionSub}>Repasa las funciones principales</Text>
            </View>
            <ChevronRight size={16} color={T.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpOption}
            onPress={() => { setHelpVisible(false); Linking.openURL('mailto:soporte@vozpe.com'); }}
          >
            <View style={[styles.helpIconBox, { backgroundColor: T.green + '14' }]}>
              <Mail size={20} color={T.green} />
            </View>
            <View style={styles.helpTextCol}>
              <Text style={styles.helpOptionTitle}>Contactar soporte</Text>
              <Text style={styles.helpOptionSub}>soporte@vozpe.com</Text>
            </View>
            <ChevronRight size={16} color={T.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setHelpVisible(false)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ── GroupCard ─────────────────────────────────────────────────────────────────
function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const typeConfig = GROUP_TYPE_CONFIG[group.type] ?? GROUP_TYPE_CONFIG.general;
  const members    = group.members ?? [];
  const hasPending = (group.pendingCount ?? 0) > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Acento izquierdo azul */}
      <View style={styles.cardAccent} />

      {/* Emoji */}
      <View style={styles.cardEmojiCol}>
        <View style={styles.cardEmojiBox}>
          <Text style={styles.cardEmoji}>{group.coverEmoji}</Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.cardBody}>
        {/* Título + categoría */}
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{group.name}</Text>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipText}>{typeConfig.label}</Text>
          </View>
        </View>

        {/* Monto */}
        <Text style={styles.cardAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {formatCurrency(group.totalAmount ?? 0, group.baseCurrency)}
        </Text>

        {/* Bottom: avatares + pendientes */}
        <View style={styles.cardFooter}>
          <AvatarGroup
            members={members.map(m => ({ name: m.displayName, colorHex: m.colorHex }))}
            size="xs"
            max={5}
          />
          {hasPending && (
            <View style={styles.pendingChip}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>
                {group.pendingCount} pendiente{(group.pendingCount ?? 0) !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChevronRight size={17} color={T.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.appBg },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: T.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: T.strokeSoft,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 14,
    overflow: 'hidden',
    // Sombra sutil
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerBlob1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: T.blue + '10',
    top: -120, right: -80,
  },
  headerBlob2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: T.green + '0C',
    bottom: -70, left: -50,
  },

  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  greetingSmall: { fontSize: 11, color: T.textMuted, fontWeight: '500' },
  greetingName:  { fontSize: 18, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },

  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCardWhite: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.cardBg,
    borderRadius: T.rCard,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: T.strokeSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statCardAccent: {
    flex: 2,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.blue,
    borderRadius: T.rCard,
    paddingHorizontal: 14, paddingVertical: 12,
    overflow: 'hidden',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 7,
  },
  statBlobAccent: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: T.green + '30',
    right: -40, bottom: -40,
  },
  statIconBox: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statTexts: { flex: 1, gap: 1 },
  statValue:       { fontSize: 18, fontWeight: '800', color: T.textPrimary, fontFamily: 'monospace' },
  statValueAccent: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'monospace', letterSpacing: -0.5 },
  statLabel:       { fontSize: 10.5, color: T.textMuted, fontWeight: '500' },
  statLabelAccent: { fontSize: 10.5, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  sectionLabel: {
    fontSize: 11.5, fontWeight: '700',
    color: T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Lista ─────────────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },
  emptyWrap:   { flex: 1, paddingHorizontal: 16 },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.cardBg,
    borderRadius: T.rCard,
    borderWidth: 1, borderColor: T.strokeSoft,
    overflow: 'hidden',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardAccent: {
    width: 3.5, alignSelf: 'stretch',
    backgroundColor: T.blue, opacity: 0.85,
  },
  cardEmojiCol: {
    width: 62, alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  cardEmojiBox: {
    width: 42, height: 42, borderRadius: T.rIcon,
    backgroundColor: T.softBlueBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft,
  },
  cardEmoji: { fontSize: 21 },

  cardBody: { flex: 1, paddingVertical: 14, paddingRight: 6, gap: 5 },
  cardTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 8, paddingRight: 4,
  },
  cardTitle: {
    flex: 1, color: T.textPrimary, fontSize: 15, fontWeight: '700', letterSpacing: -0.2,
  },
  typeChip: {
    backgroundColor: T.softBlueBg,
    borderRadius: T.rChip, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: T.strokeBlue,
  },
  typeChipText: { color: T.blue, fontSize: 10, fontWeight: '600', letterSpacing: 0.1 },

  cardAmount: {
    color: T.textPrimary, fontSize: 22, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.8,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingRight: 4,
  },

  pendingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF7E6',
    borderRadius: T.rChip, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#F59E0B35',
  },
  pendingDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: T.warning },
  pendingText: { color: T.warning, fontSize: 11, fontWeight: '600' },

  chevron: { marginHorizontal: 12 },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute', right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: T.blue,
    alignItems: 'center', justifyContent: 'center',
    ...T.shadowFab,
  },

  // ── Help Modal ────────────────────────────────────────────────────────────
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)' },
  helpSheet: {
    backgroundColor: T.cardBg,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 24,
  },
  sheetHandle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
    backgroundColor: T.strokeSoft, marginBottom: 4,
  },
  sheetHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },
  sheetCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.softBlueBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft,
  },

  helpOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: T.appBg,
    borderRadius: T.rCard,
    padding: 14,
    borderWidth: 1, borderColor: T.strokeSoft,
  },
  helpIconBox: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  helpTextCol: { flex: 1, gap: 2 },
  helpOptionTitle: { fontSize: 15, fontWeight: '600', color: T.textPrimary },
  helpOptionSub:   { fontSize: 12, color: T.textMuted },

  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { fontSize: 15, color: T.textMuted, fontWeight: '500' },
});
