
export interface ModeSettings {
  prompt: string;
  referenceImage: string | null; // base64 data URL string
}

export interface AllSettings {
  [modeName: string]: ModeSettings;
}

export type AppState = 'HOME' | 'SETTINGS' | 'CAMERA' | 'GENERATING' | 'RESULT';
