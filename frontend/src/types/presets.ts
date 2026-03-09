import type { MakeupConfig } from './makeup';

export interface MakeupPreset {
  id: string;
  name: string;
  description: string;
  gradient: [string, string]; // for card thumbnail
  config: MakeupConfig;
  tags: string[];
  isPremium: boolean;
}
