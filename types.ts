export interface AppConfig {
  appName: string;
  features: string;
  email?: string;
  campaign?: string;
}

export interface GeneratedResponse {
  translation: string;
  originalReply: string;
  turkishReply: string;
  detectedLanguage: string;
}

export enum AppState {
  SETUP = 'SETUP',
  MAIN = 'MAIN',
}