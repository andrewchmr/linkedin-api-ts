import { VoyagerDate } from '../types/voyager';

export function parseVoyagerDate(date: VoyagerDate | undefined | null): string | null {
  if (!date || !date.year) return null;

  const parts = [String(date.year)];
  if (date.month) parts.push(String(date.month).padStart(2, '0'));
  if (date.day) parts.push(String(date.day).padStart(2, '0'));

  return parts.join('-');
}
