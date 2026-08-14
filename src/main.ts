import { Plugin, MarkdownView, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './types';
import { NavigableHtmlExportSettingTab } from './settings';
import { HtmlExportModal } from './modal';
import { exportNoteToHtmlFile } from './html-builder';

export default class NavigableHtmlExportPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // 1. Ribbon Icon (globe / layout icon)
    this.addRibbonIcon('globe', 'Exportar a HTML Navegable', () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile instanceof TFile) {
        new HtmlExportModal(this.app, activeFile, this.settings).open();
      } else {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.file) {
          new HtmlExportModal(this.app, view.file, this.settings).open();
        }
      }
    });

    // 2. Command Palette: Open Export Modal
    this.addCommand({
      id: 'export-note-to-navigable-html-modal',
      name: 'Exportar nota activa a HTML Navegable (con opciones)',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.extension === 'md') {
          if (!checking) {
            new HtmlExportModal(this.app, activeFile, this.settings).open();
          }
          return true;
        }
        return false;
      },
    });

    // 3. Command Palette: Quick Export with default settings
    this.addCommand({
      id: 'quick-export-note-to-navigable-html',
      name: 'Exportación rápida a HTML Navegable',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.extension === 'md') {
          if (!checking) {
            void exportNoteToHtmlFile(this.app, activeFile, this.settings);
          }
          return true;
        }
        return false;
      },
    });

    // 4. File Context Menu (Right Click on file in file explorer)
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => {
            item
              .setTitle('Exportar a HTML Navegable')
              .setIcon('globe')
              .onClick(() => {
                new HtmlExportModal(this.app, file, this.settings).open();
              });
          });
        }
      })
    );

    // 5. Settings Tab
    this.addSettingTab(new NavigableHtmlExportSettingTab(this.app, this));
  }

  onunload(): void {
    // Cleanup if needed
  }

  async loadSettings(): Promise<void> {
    const data: unknown = await this.loadData();
    if (data && typeof data === 'object') {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data as Partial<PluginSettings>);
    } else {
      this.settings = Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
