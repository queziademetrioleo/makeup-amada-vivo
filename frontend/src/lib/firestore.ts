import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MakeupConfig } from '@/types/makeup';

// ── Saved Looks ───────────────────────────────────────────────────────────────

export interface SavedLookInput {
  userId: string;
  name: string;
  snapshotUrl: string;
  makeupConfig: MakeupConfig;
  presetId?: string;
}

export async function saveLook(input: SavedLookInput) {
  return addDoc(collection(db, 'looks'), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function getUserLooks(userId: string) {
  const q = query(
    collection(db, 'looks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteLook(lookId: string) {
  return deleteDoc(doc(db, 'looks', lookId));
}

// ── Presets (community / curated) ────────────────────────────────────────────

export async function getPublicPresets() {
  const snap = await getDocs(collection(db, 'presets'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
