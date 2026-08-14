import { App, TFile } from 'obsidian';

export async function resolveAndEmbedAttachments(
  app: App,
  markdown: string,
  sourcePath: string
): Promise<string> {
  let result = markdown;

  // 1. Resolve Obsidian Wiki-style embeds: ![[image.png|alt|300]]
  const wikiEmbedRegex = /!\[\[(.*?)\]\]/g;
  const wikiMatches = Array.from(markdown.matchAll(wikiEmbedRegex));

  for (const match of wikiMatches) {
    const fullMatch = match[0];
    const rawInner = match[1];
    const parts = rawInner.split('|');
    const linkPath = parts[0].trim();
    const altOrSize = parts.length > 1 ? parts.slice(1).join('|').trim() : '';

    const targetFile = app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath);
    if (targetFile && targetFile instanceof TFile) {
      const mimeType = getMimeType(targetFile.extension);
      if (mimeType.startsWith('image/')) {
        try {
          const buffer = await app.vault.readBinary(targetFile);
          const base64 = arrayBufferToBase64(buffer);
          const dataUri = `data:${mimeType};base64,${base64}`;

          let style = '';
          // Check if size is specified (e.g. 300 or 300x200)
          if (/^\d+(x\d+)?$/.test(altOrSize)) {
            const dims = altOrSize.split('x');
            style = `width: ${dims[0]}px;` + (dims[1] ? ` height: ${dims[1]}px;` : '');
          }

          const imgTag = `<img src="${dataUri}" alt="${escapeHtml(altOrSize || targetFile.name)}" class="exported-embed-image" style="${style}" />`;
          result = result.replace(fullMatch, imgTag);
        } catch (err) {
          console.error(`Failed to embed image ${linkPath}`, err);
        }
      }
    }
  }

  // 2. Resolve Standard Markdown images with local vault paths: ![alt](path/to/image.png)
  const mdImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const mdMatches = Array.from(result.matchAll(mdImageRegex));

  for (const match of mdMatches) {
    const fullMatch = match[0];
    const alt = match[1];
    const imagePath = match[2].trim();

    // Skip already embedded data URIs or remote http(s) URLs
    if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue;
    }

    const cleanPath = decodeURIComponent(imagePath.split('?')[0]);
    const targetFile = app.metadataCache.getFirstLinkpathDest(cleanPath, sourcePath);
    if (targetFile && targetFile instanceof TFile) {
      const mimeType = getMimeType(targetFile.extension);
      if (mimeType.startsWith('image/')) {
        try {
          const buffer = await app.vault.readBinary(targetFile);
          const base64 = arrayBufferToBase64(buffer);
          const dataUri = `data:${mimeType};base64,${base64}`;

          const imgTag = `<img src="${dataUri}" alt="${escapeHtml(alt || targetFile.name)}" class="exported-embed-image" />`;
          result = result.replace(fullMatch, imgTag);
        } catch (err) {
          console.error(`Failed to embed markdown image ${imagePath}`, err);
        }
      }
    }
  }

  return result;
}

function getMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    case 'bmp': return 'image/bmp';
    case 'ico': return 'image/x-icon';
    case 'pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
