import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import {
  COLORS, formatCurrency,
  calculateMinimalSettlements, getGroupTotals,
} from '@kivo/shared';
import type { MemberBalance } from '@kivo/shared';
import { EmptyState } from '../common/EmptyState';
import { useGroupStore } from '../../stores/group.store';
import { generateMemberColor, generateInitials } from '@kivo/shared';

interface BalanceViewProps {
  groupId: string;
  baseCurrency: string;
}

export function BalanceView({ groupId, baseCurrency }: BalanceViewProps) {
  const { entries, members } = useGroupStore();

  const balances = useMemo<MemberBalance[]>(() => {
    const map: Record<string, { paid: number; share: number }> = {};

    // Init all members
    for (const m of members) {
      if (m.userId) map[m.userId] = { paid: 0, share: 0 };
    }

    const confirmed = entries.filter(e => e.status === 'confirmed');

    for (const entry of confirmed) {
      const amount = entry.amountInBase ?? entry.amount;

      // Who paid
      if (entry.paidBy && map[entry.paidBy] !== undefined) {
        map[entry.paidBy].paid += amount;
      }

      // How splits are distributed
      if (entry.splits && entry.splits.length > 0) {
        for (const split of entry.splits) {
          if (map[split.memberId] !== undefined) {
            map[split.memberId].share += split.amount;
          }
        }
      } else {
        // Default: equal split
        const share = amount / members.length;
        for (const m of members) {
          if (m.userId && map[m.userId] !== undefined) {
            map[m.userId].share += share;
          }
        }
      }
    }

    return members.map(m => {
      const data = (m.userId ? map[m.userId] : undefined) ?? { paid: 0, share: 0 };
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

          <Text style={styles.sectionTitle}>SALDOS</Text>
        </>
      )}
      renderItem={({ item }) => <BalanceCard balance={item} />}
      ListFooterComponent={
        settlements.length > 0 ? (
          <View style={styles.settlementsSection}>
            <Text style={styles.sectionTitle}>CÓMO LIQUIDAR</Text>
            {settlements.map((s, i) => (
              <View key={i} style={styles.settlementCard}>
                <View style={styles.settlementParty}>
                  <MemberDot name={s.fromMemberName} />
                  <Text style={styles.settlementName} numberOfLines={1}>
                    {s.fromMemberName}
                  </Text>
                </View>
                <View style={styles.settlementArrow}>
                  <Text style={styles.settlementAmount}>
                    {formatCurrency(s.amount, s.currency)}
                  </Text>
                  <ArrowRight size={14} color={COLORS.kivo400} />
                </View>
                <View style={styles.settlementParty}>
                  <MemberDot name={s.toMemberName} />
                  <Text style={styles.settlementName} numberOfLines={1}>
                    {s.toMemberName}
                  </Text>
                </View>
              </View>
            ))}
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
  const color = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textTertiary;
  const memberColor = generateMemberColor(balance.memberName);
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
        {isPositive && <TrendingUp size={14} color={COLORS.success} />}
        {isNegative && <TrendingDown size={14} color={COLORS.error} />}
        {!isPositive && !isNegative && <Minus size={14} color={COLORS.textTertiary} />}
        <Text style={[styles.balanceNetText, { color }]}>
          {isPositive ? '+' : ''}{formatCurrency(balance.netBalance, balance.currency)}
        </Text>
        <Text style={[styles.balanceNetLabel, { color }]}>
          {isPositive ? 'le deben' : isNegative ? 'debe' : 'en paz'}
        </Text>
      </View>
    </View>
  );
}

function MemberDot({ name }: { name: string }) {
  const color = generateMemberColor(name);
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
    borderRadius: 16,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: { color: COLORS.textTertiary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAmount: { color: COLORS.textPrimary, fontSize: 32, fontWeight: '700', fontFamily: 'monospace', letterSpacing: -1 },
  summaryMeta: { color: COLORS.textSecondary, fontSize: 13 },

  sectionTitle: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
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
    borderBottomColor: COLORS.borderSubtle,
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
  balanceName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  balanceStats: { color: COLORS.textTertiary, fontSize: 12 },
  balanceNet: { alignItems: 'flex-end', gap: 2 },
  balanceNetText: { fontSize: 15, fontWeight: '700', fontFamily: 'monospace' },
  balanceNetLabel: { fontSize: 11 },

  settlementsSection: { paddingTop: 24, paddingBottom: 8 },
  settlementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  settlementParty: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  settlementName: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500', flex: 1 },
  settlementArrow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  settlementAmount: { color: COLORS.kivo400, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },

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
    borderRadius: 12,
    backgroundColor: `${COLORS.success}10`,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
    alignItems: 'center',
  },
  settledText: { color: COLORS.success, fontSize: 14, fontWeight: '600' },
});
