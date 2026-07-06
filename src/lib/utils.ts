import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely — resolves conflicts via tailwind-merge
 * and handles conditional class names via clsx.
 *
 * @example cn('px-4 py-2', isActive && 'bg-brand-500', 'px-6')
 *   → 'py-2 px-6' (px-4 is superseded by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a 16-digit card number into groups of 4 with a separator.
 * Partially masks middle digits for security.
 *
 * @example formatCardNumber('4111111111111111')
 *   → '4111  ••••  ••••  1111'
 */
export function formatCardNumber(raw: string, masked = true): string {
  const clean = raw.replace(/\D/g, '');
  
  if (clean.length <= 4) {
    const last4 = clean.padStart(4, '0');
    return `••••  ••••  ••••  ${last4}`;
  }

  const padded = clean.slice(0, 16).padEnd(16, '0');
  const groups = [
    padded.slice(0, 4),
    masked ? '••••' : padded.slice(4, 8),
    masked ? '••••' : padded.slice(8, 12),
    padded.slice(12, 16),
  ];
  return groups.join('  ');
}

/**
 * Clamp a number between a min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Format cents into a USD currency string.
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(Math.abs(cents) / 100);
}
