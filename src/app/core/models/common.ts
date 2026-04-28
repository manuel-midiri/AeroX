export type ThemeAccent = 'amber' | 'phosphor' | 'ice';
export type Density = 'compact' | 'comfy';
export type Language = 'en' | 'it';
export type DataSource = 'live' | 'cached';
export type SrcStatus = 'cached' | 'live' | 'fetching' | 'error';
export type ToastTone = 'amber' | 'green' | 'red' | 'cyan';

export interface Tweaks {
  theme: ThemeAccent;
  density: Density;
  scanlines: boolean;
  audio: boolean;
  language: Language;
  dataSource: DataSource;
}
