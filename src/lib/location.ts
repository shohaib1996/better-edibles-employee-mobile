import * as Location from 'expo-location';
import type { LocationSnapshot } from '@/types/api';

/** One point-in-time location, only when the employee presses a clock button. Never in the background. */
export async function locationSnapshot(): Promise<LocationSnapshot | undefined> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return undefined;
    const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
      latitude: p.coords.latitude,
      longitude: p.coords.longitude,
      accuracyMeters: p.coords.accuracy != null ? Math.round(p.coords.accuracy) : undefined,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return undefined; // location is optional; the time clock decides the policy
  }
}
