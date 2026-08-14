import { App, Component, MarkdownRenderer, TFile } from 'obsidian';
import { extractAndProtectLatex, LatexBlock, restoreAndRenderLatexInHtml } from './latex-processor';
import { resolveAndEmbedAttachments } from './attachment-resolver';
import { HeadingItem } from './types';

export interface ParseResult {
  html: string;
  headings: HeadingItem[];
}

export async function parseMarkdownToNavigableHtml(
  app: App,
  markdown: string,
  sourceFile: TFile,
  renderLatex: boolean,
  embedImages: boolean
): Promise<ParseResult> {
  // Strip YAML frontmatter so Obsidian's renderer doesn't print a raw YAML block
  let contentToRender = stripFrontmatter(markdown);
  let latexBlocks = new Map<string, LatexBlock>();

  // 1. Protect LaTeX formulas before Obsidian parsing
  if (renderLatex) {
    const latexResult = extractAndProtectLatex(contentToRender);
    contentToRender = latexResult.processedContent;
    latexBlocks = latexResult.latexBlocks;
  }

  // 2. Resolve image and media embeds to Base64
  if (embedImages) {
    contentToRender = await resolveAndEmbedAttachments(app, contentToRender, sourceFile.path);
  }

  // 3. Render Markdown using Obsidian's native parser in a detached DOM element
  const container = createDiv();
  const component = new Component();
  component.load();

  try {
    await MarkdownRenderer.render(
      app,
      contentToRender,
      container,
      sourceFile.path,
      component
    );
  } finally {
    component.unload();
  }

  // 4. Post-process Headings: Assign IDs, collapse arrows and generate TOC headings array
  const headings: HeadingItem[] = [];
  const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const usedSlugs = new Map<string, number>();

  headingElements.forEach((el, index) => {
    const level = parseInt(el.tagName.substring(1), 10);
    const originalText = el.textContent || `Sección ${index + 1}`;
    
    // Create URL-friendly slug
    let baseSlug = originalText
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u00C0-\u017F-]/g, '')
      .replace(/\s+/g, '-');

    if (!baseSlug) baseSlug = `section-${index + 1}`;

    const count = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, count + 1);
    const finalId = count > 0 ? `${baseSlug}-${count}` : baseSlug;

    el.setAttribute('id', finalId);
    el.setAttribute('data-heading-level', String(level));
    el.classList.add('navigable-heading');

    // Add collapse arrow icon button using DOM element creation
    const arrowSpan = createSpan({ cls: 'heading-collapse-btn' });
    arrowSpan.setAttribute('aria-label', 'Colapsar / Expandir sección');
    arrowSpan.setAttribute('title', 'Colapsar / Expandir sección');
    
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', '0 0 24 24');
    svgEl.setAttribute('width', '16');
    svgEl.setAttribute('height', '16');
    svgEl.setAttribute('fill', 'none');
    svgEl.setAttribute('stroke', 'currentColor');
    svgEl.setAttribute('stroke-width', '2.5');
    svgEl.setAttribute('stroke-linecap', 'round');
    svgEl.setAttribute('stroke-linejoin', 'round');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '6 9 12 15 18 9');
    svgEl.appendChild(polyline);
    arrowSpan.appendChild(svgEl);

    el.prepend(arrowSpan);

    headings.push({
      id: finalId,
      text: originalText,
      level,
    });
  });

  // 5. Post-process Code Blocks: Add copy button using DOM APIs
  const codeBlocks = container.querySelectorAll('pre > code');
  codeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (pre && !pre.querySelector('.code-copy-btn')) {
      const copyBtn = createEl('button', { cls: 'code-copy-btn' });
      copyBtn.setAttribute('aria-label', 'Copiar código');

      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('viewBox', '0 0 24 24');
      svgEl.setAttribute('width', '14');
      svgEl.setAttribute('height', '14');
      svgEl.setAttribute('fill', 'none');
      svgEl.setAttribute('stroke', 'currentColor');
      svgEl.setAttribute('stroke-width', '2');
      svgEl.setAttribute('stroke-linecap', 'round');
      svgEl.setAttribute('stroke-linejoin', 'round');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '9');
      rect.setAttribute('y', '9');
      rect.setAttribute('width', '13');
      rect.setAttribute('height', '13');
      rect.setAttribute('rx', '2');
      rect.setAttribute('ry', '2');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');

      svgEl.appendChild(rect);
      svgEl.appendChild(path);
      copyBtn.appendChild(svgEl);
      copyBtn.createSpan({ text: 'Copiar' });

      pre.classList.add('has-copy-btn');
      pre.appendChild(copyBtn);
    }
  });

  // 6. Post-process External Links: Ensure target="_blank"
  const links = container.querySelectorAll('a');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.classList.add('external-link');
    }
  });

  let finalHtml = container.innerHTML;

  // 7. Restore and render KaTeX formulas
  if (renderLatex && latexBlocks.size > 0) {
    finalHtml = restoreAndRenderLatexInHtml(finalHtml, latexBlocks);
  }

  return {
    html: finalHtml,
    headings,
  };
}

function stripFrontmatter(content: string): string {
  if (content.startsWith('---')) {
    const secondIndex = content.indexOf('\n---', 3);
    if (secondIndex !== -1) {
      return content.substring(secondIndex + 4).trimStart();
    }
  }
  return content;
}
