import { days, docStatus, permitStatus } from '@/lib/format';
import type { DocStatus, HrDoc, MeResponse } from '@/types/api';

export interface BuddyReply { text: string; badge?: DocStatus }

/**
 * Buddy answers on the phone from the employee's own data already loaded.
 * A smarter helper would run on the server, which holds the AI key, never the app.
 */
export function buddyAnswer(q: string, me: MeResponse, docs: HrDoc[], production: boolean): BuddyReply {
  const s = q.toLowerCase();
  const olcc = me.olccPermit?.status;
  if (/permit|olcc/.test(s)) {
    return { text: olcc ? `Your OLCC worker permit status is "${olcc}".` : 'HR does not have an OLCC worker permit on file for you yet.', badge: permitStatus(olcc) };
  }
  if (/pto|vacation|time off|days off/.test(s)) {
    const p = me.pto;
    return { text: p.eligible ? `You have ${days(p.availableDays)} of PTO left this year (${days(p.usedDays)} used of ${days(p.accruedDays)}).` : 'PTO starts after 6 months with the company.' };
  }
  if (/miss|need|left|todo|to do|document|form/.test(s)) {
    const missing = docs.filter((d) => docStatus(d) !== 'completed');
    const extra = [olcc ? null : 'OLCC worker permit', production ? 'food handler card (give HR a copy)' : null].filter(Boolean) as string[];
    if (missing.length === 0 && extra.length === 0) return { text: 'Nothing is missing. Everything HR needs is on file.' };
    const names = [...missing.slice(0, 5).map((d) => d.label), ...extra].join(', ');
    return { text: `Not on file yet: ${names}${missing.length > 5 ? `, and ${missing.length - 5} more` : ''}. Open My Documents to see them all.` };
  }
  return { text: 'I can help with your OLCC permit, your HR documents and your PTO. Try "What am I missing?"' };
}
