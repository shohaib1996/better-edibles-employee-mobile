import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

/** A local file chosen on the phone, ready to upload as multipart form-data. */
export interface PickedFile { uri: string; name: string; mimeType: string }

const nameFromUri = (uri: string, fallbackExt: string) => {
  const tail = uri.split(/[\\/]/).pop() || `upload.${fallbackExt}`;
  return tail.includes('.') ? tail : `${tail}.${fallbackExt}`;
};

/** Take a photo of the signed form with the camera. */
export async function takePhoto(): Promise<PickedFile | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Allow the camera to take a photo of your form.');
  const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.fileName || nameFromUri(a.uri, 'jpg'), mimeType: a.mimeType || 'image/jpeg' };
}

/** Choose an existing photo from the library. */
export async function pickFromLibrary(): Promise<PickedFile | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Allow photo access to choose a photo.');
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.fileName || nameFromUri(a.uri, 'jpg'), mimeType: a.mimeType || 'image/jpeg' };
}

/**
 * Uploads a picked file as multipart/form-data over XMLHttpRequest.
 *
 * We use XHR, not fetch, on purpose: since SDK 54 Expo makes its WHATWG
 * `expo/fetch` the global `fetch`, and that rejects React Native's
 * `{ uri, name, type }` FormData part. XHR is left untouched and uploads a
 * file URI natively, so this works whether or not expo/fetch is active.
 */
export function uploadFile(url: string, token: string | null, field: string, file: PickedFile): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append(field, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 60000;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status}).`;
      try { const b = JSON.parse(xhr.responseText); message = b.message || b.error || message; } catch { /* keep default */ }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error('No connection. Check your internet and try again.'));
    xhr.ontimeout = () => reject(new Error('The upload timed out. Try again.'));
    xhr.send(form);
  });
}

/** Pick a PDF, Word document or image file from the device. */
export async function pickFile(): Promise<PickedFile | null> {
  const r = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
    copyToCacheDirectory: true,
  });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.name || nameFromUri(a.uri, 'pdf'), mimeType: a.mimeType || 'application/octet-stream' };
}
