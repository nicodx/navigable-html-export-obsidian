import { App, Modal, Setting, TFile } from 'obsidian';
import { PluginSettings, ThemeMode } from './types';
import { exportNoteToHtmlFile } from './html-builder';

export class HtmlExportModal extends Modal {
  file: TFile;
  settings: PluginSettings;

  constructor(app: App, file: TFile, settings: PluginSettings) {
    super(app);
    this.file = file;
    // Clone settings for this modal session
    this.settings = { ...settings };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('navigable-html-export-modal');

    contentEl.createEl('h2', { text: `🌐 Exportar "${this.file.basename}" a HTML Navegable` });

    const descEl = contentEl.createDiv({ cls: 'modal-description' });
    descEl.createEl('p', { text: 'Genera un archivo HTML interactivo y autónomo, optimizado para leer en cualquier navegador web desktop o mobile.' });
    
    const badgesDiv = descEl.createDiv();
    badgesDiv.createSpan({ cls: 'feature-badge', text: '⚡ Offline / Autónomo' });
    badgesDiv.createSpan({ cls: 'feature-badge', text: '📑 Índice Interactivo' });
    badgesDiv.createSpan({ cls: 'feature-badge', text: '🧮 KaTeX LaTeX' });
    badgesDiv.createSpan({ cls: 'feature-badge', text: '🏷️ Propiedades Frontmatter' });
    badgesDiv.createSpan({ cls: 'feature-badge', text: '🖼️ Imágenes Base64' });
    badgesDiv.createSpan({ cls: 'feature-badge', text: '🌓 Modo Claro / Oscuro' });

    // --- OPCIONES DE EXPORTACIÓN ---
    new Setting(contentEl)
      .setName('Tema de color predeterminado')
      .setDesc('El tema inicial al abrir el HTML en el navegador.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('system', 'Sistema (Automático)')
          .addOption('light', 'Modo Claro')
          .addOption('dark', 'Modo Oscuro')
          .setValue(this.settings.defaultTheme)
          .onChange(value => {
            this.settings.defaultTheme = value as ThemeMode;
          });
      });

    new Setting(contentEl)
      .setName('Incluir Tabla de Contenidos (TOC)')
      .setDesc('Muestra la barra lateral interactiva con scroll-spy.')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.includeToc)
          .onChange(value => {
            this.settings.includeToc = value;
          });
      });

    new Setting(contentEl)
      .setName('Renderizar fórmulas LaTeX')
      .setDesc('Renderiza fórmulas matemáticas con KaTeX embebido offline.')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.renderLatex)
          .onChange(value => {
            this.settings.renderLatex = value;
          });
      });

    new Setting(contentEl)
      .setName('Incluir propiedades de la nota')
      .setDesc('Muestra la tarjeta de metadatos (frontmatter) al inicio del documento.')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.showProperties)
          .onChange(value => {
            this.settings.showProperties = value;
          });
      });

    new Setting(contentEl)
      .setName('Incrustar imágenes en Base64')
      .setDesc('Convierte imágenes locales para que el HTML sea 100% independiente.')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.embedImagesAsBase64)
          .onChange(value => {
            this.settings.embedImagesAsBase64 = value;
          });
      });

    new Setting(contentEl)
      .setName('Abrir en el navegador al finalizar')
      .setDesc('Abre automáticamente el archivo HTML generado.')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.openInBrowserAfterExport)
          .onChange(value => {
            this.settings.openInBrowserAfterExport = value;
          });
      });

    // --- BOTONES DE ACCIÓN ---
    const btnContainer = contentEl.createDiv({ cls: 'modal-button-container' });

    const cancelBtn = btnContainer.createEl('button', { text: 'Cancelar' });
    cancelBtn.addEventListener('click', () => {
      this.close();
    });

    const exportBtn = btnContainer.createEl('button', {
      text: '🌐 Exportar a HTML',
      cls: 'mod-cta',
    });
    exportBtn.addEventListener('click', () => {
      this.close();
      void exportNoteToHtmlFile(this.app, this.file, this.settings);
    });

    // --- PIE DE PÁGINA: DONACIONES ---
    const donateFooter = contentEl.createDiv({ cls: 'donate-footer' });
    donateFooter.createSpan({ text: '¿Te gusta este plugin? ' });
    donateFooter.createEl('a', {
      text: '☕ Invítame un café para apoyar el desarrollo',
      href: 'https://buymeacoffee.com/nicodx'
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
