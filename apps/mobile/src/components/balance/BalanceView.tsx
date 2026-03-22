import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import {
  formatCurrency,
  calculateMinimalSettlements, getGroupTotals,
} from '@vozpe/shared';
import type { MemberBalance } from '@vozpe/shared';
import { EmptyState } from '../common/EmptyState';
import { useGroupStore } from '../../stores/group.store';
import { generateInitials } from '@vozpe/shared';
import { T } from '../../theme/tokens';

interface BalanceViewProps {
  groupId: string;
  baseCurrency: string;
}

export function BalanceView({ groupId, baseCurrency }: BalanceViewProps) {
  const { entries, members } = useGroupStore();

  const balances = useMemo<MemberBalance[]>(() => {
    // Use m.id (group member ID) as map key — works for both auth users and guests
    const map: Record<string, { paid: number; share: number }> = {};

    for (const m of members) {
      map[m.id] = { paid: 0, share: 0 };
    }

    const confirmed = entries.filter(e => e.status === 'confirmed');

    for (const entry of confirmed) {
      const amount = entry.amountInBase ?? entry.amount;

      // Find paying member: paidBy stores userId, match by userId or by member id
      const payer = members.find(
        m => (m.userId && m.userId === entry.paidBy) || m.id === entry.paidBy
      );
      if (payer && map[payer.id] !== undefined) {
        map[payer.id].paid += amount;
      }

      // How splits are distributed
      if (entry.splits && entry.splits.length > 0) {
        for (const split of entry.splits) {
          // split.memberId is the group member ID
          if (map[split.memberId] !== undefined) {
            map[split.memberId].share += split.amount;
          }
        }
      } else {
        // Default: equal split across all members
        const activeMemberCount = members.length || 1;
        const share = amount / activeMemberCount;
        for (const m of members) {
          map[m.id].share += share;
        }
      }
    }

    return members.map(m => {
      const data = map[m.id] ?? { paid: 0, share: 0 };
      const net = data.paid - data.share;
      return {
        memberId: m.id,
        memberName: m.displayName,
        colorHex: m.colorHex,
        userId: m.userId,
        totalPaid: data.paid,
        totalOwed: data.share,
        netBalance: net,
        currency: baseCurrency,
      };
    });
  }, [entries, members, baseCurrency]);

  const settlements = useMemo(
    () => calculateMinimalSettlements(balances, baseCurrency),
    [balances, baseCurrency]
  );

  const { totalConfirmed, confirmedCount } = useMemo(
    () => getGroupTotals(entries),
    [entries]
  );

  if (members.length === 0) {
    return (
      <EmptyState
        emoji="⚖️"
        title="Sin miembros"
        subtitle="Agrega miembros al grupo para ver los balances."
      />
    );
  }

  if (confirmedCount === 0) {
    return (
      <EmptyState
        emoji="💰"
        title="Sin entradas confirmadas"
        subtitle="Confirma entradas para calcular quién le debe a quién."
      />
    );
  }

  return (
    <FlatList
      data={balances}
      keyExtractor={b => b.memberId}
      contentContainerStyle={styles.list}
      ListHeaderComponent={() => (
        <>
          {/* Summary strip */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total del grupo</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalConfirmed, baseCurrency)}
            </Text>
            <Text style={styles.summaryMeta}>
              {confirmedCount} entrada{confirmedCount !== 1 ? 's' : ''} confirmada{confirmedCount !== 1 ? 's' : ''}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Saldos</Text>
        </>
      )}
      renderItem={({ item }) => <BalanceCard balance={item} />}
      ListFooterComponent={
        settlements.length > 0 ? (
          <View style={styles.settlementsSection}>
            <Text style={styles.sectionTitle}>Cómo liquidar</Text>
            {settlements.map((s, i) => {
              const fromColor = balances.find(b => b.memberName === s.fromMemberName)?.colorHex;
              const toColor = balances.find(b => b.memberName === s.toMemberName)?.colorHex;
              return (
                <View key={i} style={styles.settlementCard}>
                  <View style={styles.settlementParty}>
                    <MemberDot name={s.fromMemberName} colorHex={fromColor} />
                    <Text style={styles.settlementName} numberOfLines={1}>
                      {s.fromMemberName}
                    </Text>
                  </View>
                  <View style={styles.settlementArrow}>
                    <Text style={styles.settlementAmount}>
                      {formatCurrency(s.amount, s.currency)}
                    </Text>
                    <ArrowRight size={14} color={T.blue} />
                  </View>
                  <View style={styles.settlementParty}>
                    <MemberDot name={s.toMemberName} colorHex={toColor} />
                    <Text style={styles.settlementName} numberOfLines={1}>
                      {s.toMemberName}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.settledBanner}>
            <Text style={styles.settledText}>Todos están al día</Text>
          </View>
        )
      }
    />
  );
}

function BalanceCard({ balance }: { balance: MemberBalance }) {
  const isPositive = balance.netBalance > 0.01;
  const isNegative = balance.netBalance < -0.01;
  const color = isPositive ? T.success : isNegative ? T.error : T.textMuted;
  const memberColor = balance.colorHex ?? T.blue;
  const initials = generateInitials(balance.memberName);

  return (
    <View style={styles.balanceCard}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: `${memberColor}25` }]}>
        <Text style={[styles.avatarText, { color: memberColor }]}>{initials}</Text>
      </View>

      {/* Name + stats */}
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceName}>{balance.memberName}</Text>
        <Text style={styles.balanceStats}>
          Pagó {formatCurrency(balance.totalPaid, balance.currency)} ·
          {' '}Debe {formatCurrency(balance.totalOwed, balance.currency)}
        </Text>
      </View>

      {/* Net */}
      <View style={styles.balanceNet}>
        <View style={[styles.netBadge, {
          backgroundColor: isPositive
            ? `${T.success}14`
            : isNegative
            ? `${T.error}12`
            : `${T.textMuted}10`,
          borderColor: isPositive
            ? `${T.success}30`
            : isNegative
            ? `${T.error}25`
            : `${T.textMuted}20`,
        }]}>
          {isPositive && <TrendingUp size={12} color={T.success} />}
          {isNegative && <TrendingDown size={12} color={T.error} />}
          {!isPositive && !isNegative && <Minus size={12} color={T.textMuted} />}
          <Text style={[styles.balanceNetText, { color }]}>
            {isPositive ? '+' : ''}{formatCurrency(balance.netBalance, balance.currency)}
          </Text>
        </View>
        <Text style={[styles.balanceNetLabel, { color }]}>
          {isPositive ? 'a favor' : isNegative ? 'por pagar' : 'al día'}
        </Text>
      </View>
    </View>
  );
}

function MemberDot({ name, colorHex }: { name: string; colorHex?: string }) {
  const color = colorHex ?? T.blue;
  const initials = generateInitials(name);
  return (
    <View style={[styles.miniAvatar, { backgroundColor: `${color}25` }]}>
      <Text style={[styles.miniAvatarText, { color }]}>{initials[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },

  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: T.rCard,
    backgroundColor: T.cardBg,
    borderWidth: 1,
    borderColor: T.strokeSoft,
    alignItems: 'center',
    gap: 4,
    ...T.shadowCard,
  },
  summaryLabel: { color: T.textMuted, fontSize: T.fsXs, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAmount: { color: T.textPrimary, fontSize: 32, fontWeight: '700', fontFamily: 'monospace', letterSpacing: -1 },
  summaryMeta: { color: T.textSecondary, fontSize: 13 },

  sectionTitle: {
    color: T.textMuted,
    fontSize: T.fsXs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.strokeSoft,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  balanceInfo: { flex: 1, gap: 2 },
  balanceName: { color: T.textPrimary, fontSize: 15, fontWeight: '600' },
  balanceStats: { color: T.textMuted, fontSize: 12 },
  balanceNet: { alignItems: 'flex-end', gap: 4 },
  netBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: T.rSm, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1,
  },
  balanceNetText: { fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  balanceNetLabel: { fontSize: 11, fontWeight: '500' },

  settlementsSection: { paddingTop: 24, paddingBottom: 8 },
  settlementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: T.rMd,
    backgroundColor: T.cardBg,
    borderWidth: 1,
    borderColor: T.strokeSoft,
  },
  settlementParty: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  settlementName: { color: T.textSecondary, fontSize: 13, fontWeight: '500', flex: 1 },
  settlementArrow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  settlementAmount: { color: T.blue, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },

  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: { fontSize: 11, fontWeight: '700' },

  settledBanner: {
    margin: 16,
    padding: 16,
    borderRadius: T.rMd,
    backgroundColor: T.greenSoft,
    borderWidth: 1,
    borderColor: T.strokeGreen,
    alignItems: 'center',
  },
  settledText: { color: T.success, fontSize: 14, fontWeight: '600' },
});
