import type { MemberBalance, Settlement } from '../types';

export function calculateMinimalSettlements(
  balances: MemberBalance[],
  currency = 'USD'
): Settlement[] {
  const settlements: Settlement[] = [];

  const debtors = balances
    .filter(b => b.netBalance < -0.01)
    .map(b => ({ ...b, remaining: Math.abs(b.netBalance) }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter(b => b.netBalance > 0.01)
    .map(b => ({ ...b, remaining: b.netBalance }))
    .sort((a, b) => b.remaining - a.remaining);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const transferAmount = Math.min(debtor.remaining, creditor.remaining);

    if (transferAmount > 0.01) {
      settlements.push({
        fromMemberId: debtor.memberId,
        fromMemberName: debtor.memberName,
        toMemberId: creditor.memberId,
        toMemberName: creditor.memberName,
        amount: Math.round(transferAmount * 100) / 100,
        currency,
        status: 'pending',
      });
    }

    debtor.remaining -= transferAmount;
    creditor.remaining -= transferAmount;

    if (debtor.remaining < 0.01) di++;
    if (creditor.remaining < 0.01) ci++;
  }

  return settlements;
}

export function getGroupTotals(entries: { amount: number; amountInBase?: number; status: string }[]) {
  const confirmed = entries.filter(e => e.status === 'confirmed');
  const pending = entries.filter(e => e.status === 'pending_review');

  return {
    totalConfirmed: confirmed.reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0),
    totalPending: pending.reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0),
    totalAll: entries.reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0),
    confirmedCount: confirmed.length,
    pendingCount: pending.length,
  };
}
