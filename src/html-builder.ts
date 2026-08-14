import { App, FileSystemAdapter, Notice, TFile } from 'obsidian';
import { PluginSettings } from './types';
import { parseMarkdownToNavigableHtml } from './markdown-parser';
import { renderPropertiesHtml } from './properties-renderer';
import { generateWebDocumentHtml } from './web-template';

interface ElectronDialogResult {
  canceled: boolean;
  filePath?: string;
}

interface ElectronDialog {
  showSaveDialog(options: Record<string, unknown>): Promise<ElectronDialogResult>;
}

interface ElectronShell {
  openPath(path: string): Promise<string>;
}

interface ElectronModule {
  dialog?: ElectronDialog;
  shell?: ElectronShell;
}

interface NodeFsModule {
  existsSync(filePath: string): boolean;
  mkdirSync(filePath: string, options?: { recursive: boolean }): void;
  writeFileSync(filePath: string, data: string | Uint8Array, encoding?: string): void;
}

function getElectron(): ElectronModule | null {
  try {
    const customWindow = window as unknown as Record<string, unknown>;
    const req = customWindow['require'];
    if (typeof req === 'function') {
      const requireFn = req as (moduleName: string) => unknown;
      
      let remoteModule: Record<string, unknown> | null = null;
      try {
        remoteModule = requireFn('@electron/remote') as Record<string, unknown>;
      } catch {
        // Fallback
      }

      let electronModule: Record<string, unknown> | null = null;
      try {
        electronModule = requireFn('electron') as Record<string, unknown>;
      } catch {
        // Fallback
      }

      const remoteFallback = electronModule ? (electronModule['remote'] as Record<string, unknown> | undefined) : undefined;
      const targetObj = remoteModule || remoteFallback || electronModule;

      if (targetObj) {
        return {
          dialog: (targetObj['dialog'] || electronModule?.['dialog']) as ElectronDialog | undefined,
          shell: (targetObj['shell'] || electronModule?.['shell']) as ElectronShell | undefined
        };
      }
    }
  } catch (err: unknown) {
    console.error('No se pudo cargar Electron:', err);
  }
  return null;
}

function getFs(): NodeFsModule | null {
  try {
    const customWindow = window as unknown as Record<string, unknown>;
    const requireFn = customWindow['require'];
    if (typeof requireFn === 'function') {
      return (requireFn as (moduleName: string) => NodeFsModule)('fs') || null;
    }
  } catch {
    // Ignorar si no está disponible
  }
  return null;
}

function pathJoin(...parts: string[]): string {
  const cleanParts = parts
    .map(p => String(p).trim().replace(/^[/\\]+|[/\\]+$/g, ''))
    .filter(p => p.length > 0);
  return cleanParts.join('/');
}

function getVaultBasePath(app: App): string {
  const adapter: unknown = app.vault.adapter;
  if (adapter instanceof FileSystemAdapter) {
    return adapter.getBasePath();
  }
  return '';
}

export async function exportNoteToHtmlFile(
  app: App,
  file: TFile,
  settings: PluginSettings
): Promise<string | null> {
  try {
    new Notice(`Preparando exportación HTML de "${file.basename}"...`);

    // 1. Read note content
    const markdownContent = await app.vault.read(file);

    // 2. Extract properties / frontmatter
    let propertiesHtml = '';
    if (settings.showProperties) {
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;
      propertiesHtml = renderPropertiesHtml(frontmatter, settings.excludedProperties);
    }

    // 3. Parse Markdown & collect headings
    const parseResult = await parseMarkdownToNavigableHtml(
      app,
      markdownContent,
      file,
      settings.renderLatex,
      settings.embedImagesAsBase64
    );

    // 4. Build complete standalone HTML
    const finalHtml = generateWebDocumentHtml({
      title: file.basename,
      bodyContent: parseResult.html,
      propertiesHtml,
      headings: parseResult.headings,
      settings,
    });

    // 5. Determine destination path and save
    let outputPath = '';
    const electron = getElectron();
    const fsModule = getFs();

    if (electron && electron.dialog) {
      const defaultName = `${file.basename}.html`;
      const vaultPath = getVaultBasePath(app);
      const initialFolder = file.parent ? file.parent.path : '';
      const defaultPath = pathJoin(vaultPath, initialFolder, defaultName);

      const result: ElectronDialogResult = await electron.dialog.showSaveDialog({
        title: 'Guardar Nota como HTML Navegable',
        defaultPath: defaultPath,
        filters: [
          { name: 'Documento HTML (*.html)', extensions: ['html', 'htm'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        new Notice('Exportación cancelada.');
        return null;
      }

      outputPath = String(result.filePath);
      if (fsModule) {
        fsModule.writeFileSync(outputPath, finalHtml, 'utf-8');
      } else {
        downloadHtmlBlob(defaultName, finalHtml);
        return null;
      }
    } else {
      const vaultPath = getVaultBasePath(app);
      if (vaultPath && fsModule) {
        outputPath = pathJoin(vaultPath, `${file.basename}.html`);
        fsModule.writeFileSync(outputPath, finalHtml, 'utf-8');
      } else {
        downloadHtmlBlob(`${file.basename}.html`, finalHtml);
        new Notice(`HTML exportado exitosamente: ${file.basename}.html`);
        return null;
      }
    }

    new Notice(`¡HTML exportado exitosamente!\n${outputPath}`);

    // 6. Open in default browser if configured
    if (settings.openInBrowserAfterExport && outputPath && electron?.shell) {
      void electron.shell.openPath(outputPath);
    }

    return outputPath;
  } catch (error: unknown) {
    console.error('Error al exportar nota a HTML:', error);
    new Notice(`Error al exportar HTML: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function downloadHtmlBlob(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = createEl('a', {
    href: url,
    attr: { download: filename }
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
