import { App, PluginSettingTab, Setting } from 'obsidian';
import type NavigableHtmlExportPlugin from './main';
import { ThemeMode } from './types';

export class NavigableHtmlExportSettingTab extends PluginSettingTab {
  plugin: NavigableHtmlExportPlugin;

  constructor(app: App, plugin: NavigableHtmlExportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const introEl = containerEl.createDiv({ cls: 'setting-item-description' });
    const p = introEl.createEl('p');
    p.createEl('strong', { text: 'Navigable HTML Export' });
    p.appendText(' exporta tus notas de Obsidian a documentos HTML interactivos, modernos y responsivos con fórmulas LaTeX (KaTeX), propiedades (frontmatter), tabla de contenidos interactiva con Scroll-Spy y modo oscuro/claro.');

    // --- SECCIÓN: DONACIÓN ---
    new Setting(containerEl)
      .setName('☕ Apoyar el Desarrollo')
      .setHeading();

    new Setting(containerEl)
      .setName('Puedes colaborar conmigo')
      .setDesc('Si este plugin te resulta de utilidad, puedes apoyar su mantenimiento invitándome un café.')
      .addButton(button => {
        button
          .setButtonText('☕ Invitar un café (Buy Me a Coffee)')
          .setCta()
          .onClick(() => {
            window.open('https://buymeacoffee.com/nicodx', '_blank');
          });
      });

    // --- SECCIÓN: NAVEGACIÓN Y APARIENCIA ---
    new Setting(containerEl)
      .setName('🎨 Apariencia y Navegación')
      .setHeading();

    new Setting(containerEl)
      .setName('Tema de color predeterminado')
      .setDesc('Tema con el que se cargará inicialmente el archivo HTML.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('system', 'Sistema (Automático)')
          .addOption('light', 'Modo Claro')
          .addOption('dark', 'Modo Oscuro')
          .setValue(this.plugin.settings.defaultTheme)
          .onChange(async (value: string) => {
            this.plugin.settings.defaultTheme = value as ThemeMode;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Incluir Tabla de Contenidos (TOC)')
      .setDesc('Genera una barra lateral con los encabezados del documento y seguimiento de lectura.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeToc)
          .onChange(async (value: boolean) => {
            this.plugin.settings.includeToc = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Filtro de búsqueda en la TOC')
      .setDesc('Muestra un campo de búsqueda en la barra lateral para filtrar títulos.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeSearchInToc)
          .onChange(async (value: boolean) => {
            this.plugin.settings.includeSearchInToc = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Barra de progreso de lectura')
      .setDesc('Indicador visual superior del avance de lectura al hacer scroll.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeReadingProgress)
          .onChange(async (value: boolean) => {
            this.plugin.settings.includeReadingProgress = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Botón volver arriba')
      .setDesc('Botón flotante en la esquina inferior derecha para regresar al inicio.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeBackToTop)
          .onChange(async (value: boolean) => {
            this.plugin.settings.includeBackToTop = value;
            await this.plugin.saveSettings();
          });
      });

    // --- SECCIÓN: CONTENIDO ---
    new Setting(containerEl)
      .setName('📄 Contenido y Metadatos')
      .setHeading();

    new Setting(containerEl)
      .setName('Renderizar fórmulas LaTeX')
      .setDesc('Convierte expresiones $...$ y $$...$$ con KaTeX offline integrado.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.renderLatex)
          .onChange(async (value: boolean) => {
            this.plugin.settings.renderLatex = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Incluir propiedades de la nota (Frontmatter)')
      .setDesc('Muestra la tarjeta estilizada de propiedades al inicio de la nota.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.showProperties)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showProperties = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Incrustar imágenes locales en Base64')
      .setDesc('Inserta las imágenes del vault directamente en el HTML para que sea 100% portable y funcione sin conexión.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.embedImagesAsBase64)
          .onChange(async (value: boolean) => {
            this.plugin.settings.embedImagesAsBase64 = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Botón copiar en bloques de código')
      .setDesc('Agrega un botón en cada bloque de código para copiar su contenido.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeCodeCopyButton)
          .onChange(async (value: boolean) => {
            this.plugin.settings.includeCodeCopyButton = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Abrir HTML en el navegador al exportar')
      .setDesc('Abre automáticamente el archivo HTML en tu navegador web tras completarse la exportación.')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.openInBrowserAfterExport)
          .onChange(async (value: boolean) => {
            this.plugin.settings.openInBrowserAfterExport = value;
            await this.plugin.saveSettings();
          });
      });
  }

  hide(): void {
    const { containerEl } = this;
    containerEl.empty();
  }
}
