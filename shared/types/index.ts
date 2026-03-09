// Shared types between frontend and backend functions

export interface SavedLook {
  id: string;
  userId: string;
  name: string;
  snapshotUrl: string;
  presetId?: string;
  makeupConfig: Record<string, unknown>;
  createdAt: number;
}

export interface PresetDocument {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  tags: string[];
  isPremium: boolean;
  usageCount: number;
  createdAt: number;
}

export interface SnapshotUploadPayload {
  userId: string;
  imageBase64: string;
  makeupConfig: Record<string, unknown>;
  lookName?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
