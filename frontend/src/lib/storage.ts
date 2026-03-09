import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a base64 data URL to Firebase Storage and returns the public URL.
 */
export async function uploadSnapshot(
  userId: string,
  dataUrl: string,
): Promise<string> {
  const filename = `snapshots/${userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
}
