import type { Punch } from '@/types/api';

/** A day can have more than one punch (split shifts); group them into one row per day. */
export function byDay(punches: Punch[]) {
  const map = new Map<string, Punch[]>();
  for (const p of punches) map.set(p.workDate, [...(map.get(p.workDate) ?? []), p]);
  return [...map.entries()].map(([date, list]) => ({
    date,
    list,
    hours: +list.reduce((a, p) => a + p.hours, 0).toFixed(2),
    open: list.some((p) => p.open),
  }));
}
