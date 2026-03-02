/**
 * ORI APP — Formatting Utilities
 */

import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';
import { BUSINESS } from './constants';

// ─── Currency ─────────────────────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  options?: { showCents?: boolean; currency?: string }
): string {
  const { showCents = true, currency = 'USD' } = options ?? {};
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

// ─── Cart Math ────────────────────────────────────────────────────────────────
export function calculateOrderTotals(subtotal: number) {
  const shipping = subtotal >= BUSINESS.shopFreeShippingOver
    ? 0
    : BUSINESS.shopShippingFlat;
  const tax = Math.round(subtotal * BUSINESS.shopTaxRate * 100) / 100;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  return { subtotal, tax, shipping, total };
}

// ─── Dates ────────────────────────────────────────────────────────────────────
export function formatDate(date: Date | string, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'h:mm a')}`;
  return format(d, pattern);
}

export function formatPickupDateTime(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const dt = new Date(year, month - 1, day, hour, minute);
  return formatDate(dt, "EEEE, MMMM d 'at' h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTimeSlot(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute} ${amPm}`;
}

export function generatePickupTimeSlots(): string[] {
  const slots: string[] = [];
  const [startHour] = BUSINESS.pickupWindowStart.split(':').map(Number);
  const [endHour] = BUSINESS.pickupWindowEnd.split(':').map(Number);
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

// ─── Reservation Code ─────────────────────────────────────────────────────────
export function generateReservationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${BUSINESS.reservationCodePrefix}-${timestamp}-${random}`;
}

// ─── String ───────────────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export function formatPercentage(value: number | null, label: string): string {
  if (value === null) return '';
  return `${label}: ${value.toFixed(1)}%`;
}

export function formatStrainType(type: string | null): string {
  if (!type) return '';
  return titleCase(type);
}

export function getStrainColor(type: string | null): string {
  switch (type) {
    case 'indica':   return '#6B46C1'; // purple
    case 'sativa':   return '#D97706'; // amber
    case 'hybrid':   return '#059669'; // green
    case 'cbd':      return '#2563EB'; // blue
    case 'balanced': return '#7C3AED'; // violet
    default:         return '#6B7280'; // gray
  }
}

// ─── Order Status ─────────────────────────────────────────────────────────────
export function formatOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    pending:    'Pending',
    paid:       'Payment Received',
    processing: 'Processing',
    shipped:    'Shipped',
    delivered:  'Delivered',
    cancelled:  'Cancelled',
    refunded:   'Refunded',
  };
  return labels[status] ?? titleCase(status);
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending:    '#F59E0B',
    paid:       '#22C55E',
    processing: '#3B82F6',
    shipped:    '#8B5CF6',
    delivered:  '#10B981',
    cancelled:  '#EF4444',
    refunded:   '#6B7280',
  };
  return colors[status] ?? '#6B7280';
}
