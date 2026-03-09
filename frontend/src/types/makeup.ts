export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type NormalizedLandmarkList = NormalizedLandmark[];

// ── Makeup layers ────────────────────────────────────────────────────────────

export interface LipstickConfig {
  enabled: boolean;
  color: string;     // hex
  opacity: number;   // 0–1
  glossy: boolean;
}

export interface BlushConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface ContourConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface FoundationConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface BrowsConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface SkinSmoothConfig {
  enabled: boolean;
  intensity: number; // 0–1
}

export interface ConcealerConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface MakeupConfig {
  lipstick:   LipstickConfig;
  blush:      BlushConfig;
  contour:    ContourConfig;
  foundation: FoundationConfig;
  brows:      BrowsConfig;
  concealer:  ConcealerConfig;
  skinSmooth: SkinSmoothConfig;
}

export type MakeupLayer = Exclude<keyof MakeupConfig, 'skinSmooth'>;

// ── Engine input ─────────────────────────────────────────────────────────────

export interface MakeupRenderInput {
  ctx: CanvasRenderingContext2D;
  landmarks: NormalizedLandmarkList;
  width: number;
  height: number;
  config: MakeupConfig;
}
