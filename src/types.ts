export type ThemeMode = 'system' | 'light' | 'dark';

export interface PluginSettings {
  defaultTheme: ThemeMode;
  includeToc: boolean;
  includeSearchInToc: boolean;
  includeReadingProgress: boolean;
  includeBackToTop: boolean;
  renderLatex: boolean;
  showProperties: boolean;
  embedImagesAsBase64: boolean;
  includeCodeCopyButton: boolean;
  openInBrowserAfterExport: boolean;
  excludedProperties: string[];
}

export const DEFAULT_SETTINGS: PluginSettings = {
  defaultTheme: 'system',
  includeToc: true,
  includeSearchInToc: true,
  includeReadingProgress: true,
  includeBackToTop: true,
  renderLatex: true,
  showProperties: true,
  embedImagesAsBase64: true,
  includeCodeCopyButton: true,
  openInBrowserAfterExport: true,
  excludedProperties: ['cssclasses', 'publish', 'draft'],
};

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}
