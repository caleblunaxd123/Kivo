/**
 * Formatting utilities for Kivo
 */

/** Validates that a currency string is a 3-letter ISO 4217 code. */
const VALID_CURRENCY_RE = /^[A-Z]{3}$/;

function sanitizeCurrency(currency: string | null | undefined): string {
  if (!currency) return 'USD';
  const code = currency.trim().toUpperCase();
  return VALID_CURRENCY_RE.test(code) ? code : 'USD';
}

export function formatCurrency(
  amount: number,
  currency?: string | null,
  locale = 'es-PE'
): string {
  const safeCode = sanitizeCurrency(currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    // Last-resort: plain number + code (Hermes may reject valid-looking codes on some Android versions)
    return `${safeCode}\u00A0${(amount ?? 0).toFixed(2)}`;
  }
}

export function formatCompactCurrency(
  amount: number,
  currency?: string | null,
  locale = 'es-PE'
): string {
  const safeCode = sanitizeCurrency(currency);
  if (Math.abs(amount) >= 1_000_000) {
    return `${formatCurrencySymbol(safeCode)}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${formatCurrencySymbol(safeCode)}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, safeCode, locale);
}

export function formatCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    PEN: 'S/',
    GBP: '£',
    JPY: '¥',
    CLP: '$',
    COP: '$',
    MXN: '$',
    ARS: '$',
    BRL: 'R$',
  };
  return symbols[currency] ?? currency;
}

export function formatDate(date: string | Date, locale = 'es-PE'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(d);
}

export function formatRelativeTime(date: string | Date, locale = 'es-PE'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(d, locale);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatQuantity(qty: number): string {
  if (qty === Math.floor(qty)) return qty.toString();
  return qty.toFixed(2).replace(/\.?0+$/, '');
}
