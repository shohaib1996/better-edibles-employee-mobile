import type { DocStatus, HrDoc } from '@/types/api';

// The company works on Pacific time; show every time and day that way.
export const TZ = 'America/Los_Angeles';

export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
export const hours = (n: number) => `${n.toFixed(2)} hrs`;
export const days = (n: number) => `${n % 1 === 0 ? n : n.toFixed(1)} day${n === 1 ? '' : 's'}`;

const noon = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`);
export const dayLabel = (iso: string) => noon(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');
export const shortDate = (iso: string) => noon(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const longDate = (iso: string) => noon(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const clockTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }) : '-');
export const todayPacific = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const addDays = (iso: string, n: number) => { const d = noon(iso); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };

export const formatPhone = (p?: string | null) => {
  const d = (p ?? '').replace(/\D/g, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p || '-';
};

/** On file = completed; HR marking it pending = pending; otherwise not started. */
export const docStatus = (d: HrDoc): DocStatus =>
  d.onFile ? 'completed' : /pend|review|submitted/i.test(d.hrStatus ?? '') ? 'pending' : 'missing';

export const permitStatus = (s?: string): DocStatus => (!s ? 'missing' : /approv|valid|active|complete/i.test(s) ? 'completed' : 'pending');

export const firstName = (name?: string | null) => name?.trim().split(/\s+/)[0] || 'there';

export const greeting = () => {
  const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: TZ }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
