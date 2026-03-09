import { storage } from '../config/firebase';
import { createDocument } from '../repositories/firestoreRepository';
import type { SnapshotPayload } from '../validators/snapshotValidator';

export async function persistSnapshot(
  userId: string,
  payload: SnapshotPayload,
): Promise<{ url: string; lookId: string }> {
  // Strip data URL header and decode
  const base64Data = payload.imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const filename = `snapshots/${userId}/${Date.now()}.jpg`;
  const bucket = storage.bucket();
  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: { contentType: 'image/jpeg' },
    public: true,
  });

  const url = file.publicUrl();

  const lookId = await createDocument('looks', {
    userId,
    name: payload.lookName ?? `Look ${new Date().toLocaleDateString('pt-BR')}`,
    snapshotUrl: url,
    makeupConfig: payload.makeupConfig,
  });

  return { url, lookId };
}
