import { Linking } from 'react-native';
import { clockTime } from '@/lib/format';
import type { Stop } from '@/types/api';

export const paymentLabel: Record<string, string> = {
  collect_payment: 'Collect payment', collect: 'Collect payment', invoice: 'Invoice',
  may_not_collect: 'May not collect', no_payment: 'No payment', none: 'No payment',
};

/** Date-only stops are stored at midnight; they have no time to show. */
export const stopTime = (s: Stop) => { const t = clockTime(s.scheduledAt); return t === '12:00 AM' ? null : t; };

/** Opens turn-by-turn directions in the phone's maps app. */
export const openDirections = (s: Stop) =>
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.address}, ${s.city}, ${s.state}`)}`);
