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

    // Add collapse arrow icon button using Obsidian's createSvg helper
    const arrowSpan = createSpan({ cls: 'heading-collapse-btn' });
    arrowSpan.setAttribute('aria-label', 'Colapsar / Expandir sección');
    arrowSpan.setAttribute('title', 'Colapsar / Expandir sección');
    
    const svgEl = arrowSpan.createSvg('svg', {
      attr: {
        viewBox: '0 0 24 24',
        width: '16',
        height: '16',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }
    });
    svgEl.createSvg('polyline', {
      attr: { points: '6 9 12 15 18 9' }
    });

    el.prepend(arrowSpan);

    headings.push({
      id: finalId,
      text: originalText,
      level,
    });
  });

  // 5. Post-process Code Blocks: Add copy button using Obsidian createSvg helper
  const codeBlocks = container.querySelectorAll('pre > code');
  codeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (pre && !pre.querySelector('.code-copy-btn')) {
      const copyBtn = createEl('button', { cls: 'code-copy-btn' });
      copyBtn.setAttribute('aria-label', 'Copiar código');

      const svgEl = copyBtn.createSvg('svg', {
        attr: {
          viewBox: '0 0 24 24',
          width: '14',
          height: '14',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }
      });
      svgEl.createSvg('rect', {
        attr: { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }
      });
      svgEl.createSvg('path', {
        attr: { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }
      });

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
