import { db } from '../config/firebase';
import { createDocument, getCollection } from '../repositories/firestoreRepository';

export async function getPublicPresets() {
  return getCollection('presets', [{ field: 'isPremium', op: '==', value: false }]);
}

export async function incrementPresetUsage(presetId: string): Promise<void> {
  const { FieldValue } = await import('firebase-admin/firestore');
  await db.collection('presets').doc(presetId).update({
    usageCount: FieldValue.increment(1),
  });
}

export async function createPreset(data: {
  name: string;
  description: string;
  config: Record<string, unknown>;
  tags: string[];
  isPremium: boolean;
}): Promise<string> {
  return createDocument('presets', { ...data, usageCount: 0 });
}
