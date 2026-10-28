import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL } from './config';

/**
 * Downloads a protected file (sends the employee JWT) into the cache, then opens
 * the system share sheet so the employee can save or open it.
 */
export async function downloadAndShare(path: string, token: string, fallbackName: string) {
  const target = `${FileSystem.cacheDirectory}${fallbackName.replace(/[^\w.-]+/g, '_')}`;
  const res = await FileSystem.downloadAsync(`${API_BASE_URL}${path}`, target, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) throw new Error('No file on record for this document.');
  if (res.status >= 400) throw new Error('Could not download the file.');
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(res.uri, { mimeType: res.headers['Content-Type'] ?? res.headers['content-type'] });
  return res.uri;
}
