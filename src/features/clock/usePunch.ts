import { useState } from 'react';
import { errorMessage, isPinRequired } from '@/lib/errors';
import { locationSnapshot } from '@/lib/location';
import { usePunchMutation } from '@/store/api';
import type { ClockAction } from '@/types/api';

/**
 * Runs one time-clock action. Accounting decides everything; the app only
 * sends the button press, an optional location snapshot and, if the server
 * asks for it, the employee's time clock PIN.
 */
export function usePunch() {
  const [punch] = usePunchMutation();
  const [busy, setBusy] = useState<ClockAction | null>(null);
  const [error, setError] = useState('');
  const [needPin, setNeedPin] = useState<{ action: ClockAction; message: string } | null>(null);

  async function run(action: ClockAction, pin?: string) {
    setError(''); setBusy(action);
    try {
      const location = await locationSnapshot();
      await punch({ action, location, pin }).unwrap();
      setNeedPin(null);
    } catch (e) {
      if (isPinRequired(e)) setNeedPin({ action, message: errorMessage(e, 'Enter your time clock PIN') });
      else setError(errorMessage(e, 'Could not reach the time clock.'));
    } finally {
      setBusy(null);
    }
  }

  return { busy, error, needPin, run, cancelPin: () => setNeedPin(null) };
}

export type PunchController = ReturnType<typeof usePunch>;
