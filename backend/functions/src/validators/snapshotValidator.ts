export interface SnapshotPayload {
  imageBase64: string;
  lookName?: string;
  makeupConfig: Record<string, unknown>;
}

export function validateSnapshotPayload(data: unknown): SnapshotPayload {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid payload: expected object');
  }

  const d = data as Record<string, unknown>;

  if (typeof d.imageBase64 !== 'string' || !d.imageBase64.startsWith('data:image')) {
    throw new Error('Invalid imageBase64');
  }

  if (Buffer.byteLength(d.imageBase64, 'utf8') > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5MB)');
  }

  if (typeof d.makeupConfig !== 'object' || d.makeupConfig === null) {
    throw new Error('Invalid makeupConfig');
  }

  return {
    imageBase64: d.imageBase64,
    lookName: typeof d.lookName === 'string' ? d.lookName : undefined,
    makeupConfig: d.makeupConfig as Record<string, unknown>,
  };
}
