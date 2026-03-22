import type { SplitRule } from '../types';

export interface SplitInput {
  totalAmount: number;
  members: { id: string; name: string }[];
  excludedIds?: string[];
  rule: SplitRule;
  customSplits?: { memberId: string; value: number }[];
}

export interface SplitResult {
  splits: { memberId: string; amount: number; percentage: number }[];
  totalAllocated: number;
  remainderCents: number;
}

export function calculateSplits(input: SplitInput): SplitResult {
  const activeMemberIds = input.members
    .map(m => m.id)
    .filter(id => !input.excludedIds?.includes(id));

  if (activeMemberIds.length === 0) {
    return { splits: [], totalAllocated: 0, remainderCents: 0 };
  }

  switch (input.rule) {
    case 'equal':
      return calculateEqualSplit(input.totalAmount, activeMemberIds);
    case 'percentage':
      return calculatePercentageSplit(input.totalAmount, input.customSplits ?? [], activeMemberIds);
    case 'fixed':
      return calculateFixedSplit(input.totalAmount, input.customSplits ?? [], activeMemberIds);
    case 'shares':
      return calculateSharesSplit(input.totalAmount, input.customSplits ?? [], activeMemberIds);
    case 'custom':
      return calculateFixedSplit(input.totalAmount, input.customSplits ?? [], activeMemberIds);
    default:
      return calculateEqualSplit(input.totalAmount, activeMemberIds);
  }
}

function calculateEqualSplit(amount: number, memberIds: string[]): SplitResult {
  const count = memberIds.length;
  const roundedAmount = Math.floor((amount / count) * 100) / 100;
  const allocated = roundedAmount * count;
  const remainderCents = Math.round((amount - allocated) * 100);

  const splits = memberIds.map((memberId, index) => ({
    memberId,
    amount: index === 0 ? roundedAmount + remainderCents / 100 : roundedAmount,
    percentage: 100 / count,
  }));

  return { splits, totalAllocated: amount, remainderCents: 0 };
}

function calculatePercentageSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    const percentage = custom?.value ?? 0;
    return { memberId, amount: Math.round(amount * percentage) / 100, percentage };
  });
  return { splits, totalAllocated: splits.reduce((s, r) => s + r.amount, 0), remainderCents: 0 };
}

function calculateSharesSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const totalShares = customSplits.reduce((sum, s) => sum + s.value, 0);
  if (totalShares === 0) return calculateEqualSplit(amount, activeIds);

  const amountPerShare = amount / totalShares;
  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    const shares = custom?.value ?? 0;
    return { memberId, amount: Math.round(amountPerShare * shares * 100) / 100, percentage: (shares / totalShares) * 100 };
  });
  return { splits, totalAllocated: splits.reduce((s, r) => s + r.amount, 0), remainderCents: 0 };
}

function calculateFixedSplit(
  amount: number,
  customSplits: { memberId: string; value: number }[],
  activeIds: string[]
): SplitResult {
  const splits = activeIds.map(memberId => {
    const custom = customSplits.find(s => s.memberId === memberId);
    return { memberId, amount: custom?.value ?? 0, percentage: (custom && amount > 0) ? (custom.value / amount) * 100 : 0 };
  });
  const totalAllocated = splits.reduce((s, r) => s + r.amount, 0);
  return { splits, totalAllocated, remainderCents: Math.round((amount - totalAllocated) * 100) };
}
