import * as FileSystem from 'expo-file-system/legacy';
import { requestPermissionsAsync as requestMediaPermissions, saveToLibraryAsync } from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL } from './config';

// Downloads a protected file (sends the employee JWT) into the app cache.
async function fetchToCache(path: string, token: string, fallbackName: string) {
  const target = `${FileSystem.cacheDirectory}${fallbackName.replace(/[^\w.-]+/g, '_')}`;
  const res = await FileSystem.downloadAsync(`${API_BASE_URL}${path}`, target, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) throw new Error('No file on record for this document.');
  if (res.status >= 400) throw new Error('Could not download the file.');
  const mime = (res.headers['Content-Type'] ?? res.headers['content-type'] ?? '').toLowerCase();
  return { uri: res.uri, mime };
}

/**
 * Downloads a protected file, then opens the system share sheet so the employee
 * can save or open it. Used for HR documents and blank forms.
 */
export async function downloadAndShare(path: string, token: string, fallbackName: string) {
  const { uri, mime } = await fetchToCache(path, token, fallbackName);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: mime || undefined });
  return uri;
}

export type SaveResult = 'saved' | 'shared';

/**
 * Downloads a protected file and actually saves it to the device: images go
 * straight to the Photos gallery; anything else (e.g. a PDF) falls back to the
 * share/save sheet. Returns which path was taken so the UI can confirm.
 */
export async function saveToDevice(path: string, token: string, fallbackName: string, mimeHint?: string | null): Promise<SaveResult> {
  const { uri, mime } = await fetchToCache(path, token, fallbackName);
  const type = (mimeHint ?? mime).toLowerCase();
  const isImage = type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(fallbackName);
  if (isImage) {
    const perm = await requestMediaPermissions(true); // write-only
    if (perm.granted) {
      await saveToLibraryAsync(uri);
      return 'saved';
    }
  }
  // Non-image, or gallery permission denied: let the employee save via the sheet.
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: type || undefined });
  return 'shared';
}
