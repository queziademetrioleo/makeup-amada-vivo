import * as functions from 'firebase-functions/v2/https';
import { validateSnapshotPayload } from './validators/snapshotValidator';
import { persistSnapshot } from './services/snapshotService';
import { getPublicPresets, incrementPresetUsage } from './services/presetService';
import { auth } from './config/firebase';

// ── saveSnapshot ─────────────────────────────────────────────────────────────
// Callable function — receives image base64 from the frontend and uploads
// to Storage, then persists the look metadata in Firestore.
export const saveSnapshot = functions.onCall(
  { maxInstances: 10, timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError('unauthenticated', 'Authentication required.');
    }

    try {
      const payload = validateSnapshotPayload(request.data);
      const result = await persistSnapshot(request.auth.uid, payload);
      return { success: true, ...result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new functions.HttpsError('invalid-argument', message);
    }
  },
);

// ── getPresets ────────────────────────────────────────────────────────────────
export const getPresets = functions.onCall(
  { maxInstances: 5 },
  async () => {
    const presets = await getPublicPresets();
    return { success: true, presets };
  },
);

// ── trackPresetUsage ──────────────────────────────────────────────────────────
export const trackPresetUsage = functions.onCall(
  { maxInstances: 5 },
  async (request) => {
    const presetId = request.data?.presetId as string | undefined;
    if (!presetId || typeof presetId !== 'string') {
      throw new functions.HttpsError('invalid-argument', 'presetId is required');
    }
    await incrementPresetUsage(presetId);
    return { success: true };
  },
);
