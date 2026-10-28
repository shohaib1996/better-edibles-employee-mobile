// Backend origin, e.g. https://app.better-edibles.com (HTTPS is required for release builds).
// In development on a phone, use your computer's LAN IP, e.g. http://192.168.1.20:3001.
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
