import katex from 'katex';
import { KATEX_CSS } from './katex-css';

export interface LatexBlock {
  id: string;
  math: string;
  displayMode: boolean;
}

export function extractAndProtectLatex(content: string): {
  processedContent: string;
  latexBlocks: Map<string, LatexBlock>;
} {
  const latexBlocks = new Map<string, LatexBlock>();
  let blockIndex = 0;

  // 1. Process math blocks $$...$$ (multiline & single line)
  let result = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, math: string): string => {
    const id = `LATEXBLOCKTOKEN${blockIndex++}END`;
    const cleanMath = String(math).trim();
    latexBlocks.set(id, {
      id,
      math: cleanMath,
      displayMode: true,
    });
    return `\n\n${id}\n\n`;
  });

  // 2. Process inline math $...$ (not preceded by \ and no empty content)
  result = result.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (match: string, math: string): string => {
    const cleanMath = String(math).trim();
    if (!cleanMath) return match;
    const id = `LATEXINLINETOKEN${blockIndex++}END`;
    latexBlocks.set(id, {
      id,
      math: cleanMath,
      displayMode: false,
    });
    return id;
  });

  return { processedContent: result, latexBlocks };
}

export function restoreAndRenderLatexInHtml(
  htmlContent: string,
  latexBlocks: Map<string, LatexBlock>
): string {
  let result = htmlContent;

  for (const [id, block] of latexBlocks.entries()) {
    try {
      const rendered = katex.renderToString(block.math, {
        displayMode: block.displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });

      const wrapper = block.displayMode
        ? `<div class="katex-display-wrapper">${rendered}</div>`
        : `<span class="katex-inline-wrapper">${rendered}</span>`;

      // Handle raw id, paragraphs containing only the id, and paragraph wrapped ids
      const pPattern = new RegExp(`<p>\\s*${id}\\s*<\\/p>`, 'g');
      if (pPattern.test(result)) {
        result = result.replace(pPattern, wrapper);
      } else {
        result = result.split(id).join(wrapper);
      }
    } catch (e: unknown) {
      console.error(`Error rendering KaTeX for formula: ${block.math}`, e);
      const fallback = `<span class="katex-error" title="KaTeX error">${block.math}</span>`;
      result = result.split(id).join(fallback);
    }
  }

  return result;
}

export function getKaTexCss(): string {
  return KATEX_CSS;
}
