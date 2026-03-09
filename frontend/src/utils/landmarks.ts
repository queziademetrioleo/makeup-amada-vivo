import type { NormalizedLandmark, NormalizedLandmarkList } from '@/types/makeup';

// ── MediaPipe Face Mesh landmark index groups ─────────────────────────────────

export const LANDMARK_GROUPS = {
  // Outer lip contour (clockwise, closes back at 61)
  lipsOuterUpper: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  lipsOuterLower: [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61],

  // Inner lip (for occlusion masks)
  lipsInnerUpper: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  lipsInnerLower: [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78],

  // Left eyebrow (person's left = viewer's right)
  leftBrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  // Right eyebrow
  rightBrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],

  // Face oval for foundation mask
  faceOval: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
    379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
    234, 127, 162, 21, 54, 103, 67, 109,
  ],

  // Left eye (to exclude from foundation)
  leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173],
  // Right eye
  rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],

  // Blush zones — clustered cheek landmarks
  leftCheek: [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 187, 207, 206, 203, 101, 50],
  rightCheek: [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 411, 427, 426, 423, 330, 280],

  // Contour zones
  leftContour: [234, 93, 132, 58, 172, 136, 150, 149, 176],
  rightContour: [454, 323, 361, 288, 397, 365, 379, 378, 400],
  noseSides: [48, 64, 102, 331, 294, 278],
} as const;

// ── Conversion helpers ─────────────────────────────────────────────────────────

export function toPixel(
  lm: NormalizedLandmark,
  width: number,
  height: number,
): [number, number] {
  return [lm.x * width, lm.y * height];
}

export function groupToPixels(
  indices: readonly number[],
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
): [number, number][] {
  return indices.map((i) => toPixel(landmarks[i], width, height));
}

/** Compute the centroid of a set of landmark indices */
export function centroid(
  indices: readonly number[],
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
): [number, number] {
  const pts = groupToPixels(indices, landmarks, width, height);
  const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [x, y];
}
