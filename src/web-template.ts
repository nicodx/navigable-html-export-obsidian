import { HeadingItem, PluginSettings } from './types';
import { getKaTexCss } from './latex-processor';

export function generateWebDocumentHtml(params: {
  title: string;
  bodyContent: string;
  propertiesHtml: string;
  headings: HeadingItem[];
  settings: PluginSettings;
}): string {
  const { title, bodyContent, propertiesHtml, headings, settings } = params;
  const katexCss = settings.renderLatex ? getKaTexCss() : '';

  const tocItemsHtml = headings.map(h => {
    const indentClass = `toc-level-${h.level}`;
    return `<a href="#${h.id}" class="toc-link ${indentClass}" data-target="${h.id}">${escapeHtml(h.text)}</a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es" data-theme="${settings.defaultTheme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="generator" content="Obsidian Navigable HTML Export Plugin">
  <style>
    /* --- CSS RESET & VARIABLES --- */
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      
      /* Light Theme (Default) */
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --bg-card: #ffffff;
      --border-color: #e2e8f0;
      --border-hover: #cbd5e1;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-accent: #2563eb;
      --text-accent-hover: #1d4ed8;
      --accent-soft: #eff6ff;
      --tag-bg: #e0f2fe;
      --tag-color: #0369a1;
      --code-bg: #f8fafc;
      --code-border: #e2e8f0;
      --quote-border: #3b82f6;
      --quote-bg: #f8fafc;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --toc-active-bg: #eff6ff;
      --toc-active-text: #2563eb;
      --toc-active-border: #2563eb;
      --topbar-bg: rgba(255, 255, 255, 0.85);
      --scrollbar-thumb: #cbd5e1;
    }

    [data-theme="dark"] {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --bg-tertiary: #334155;
      --bg-card: #1e293b;
      --border-color: #334155;
      --border-hover: #475569;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-accent: #60a5fa;
      --text-accent-hover: #93c5fd;
      --accent-soft: #1e3a8a;
      --tag-bg: #0c4a6e;
      --tag-color: #7dd3fc;
      --code-bg: #1e293b;
      --code-border: #334155;
      --quote-border: #60a5fa;
      --quote-bg: #1e293b;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
      --toc-active-bg: rgba(96, 165, 250, 0.15);
      --toc-active-text: #93c5fd;
      --toc-active-border: #60a5fa;
      --topbar-bg: rgba(15, 23, 42, 0.85);
      --scrollbar-thumb: #475569;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      font-size: 16px;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-primary);
      color: var(--text-main);
      line-height: 1.7;
      transition: background-color 0.25s ease, color 0.25s ease;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* --- READING PROGRESS BAR --- */
    .reading-progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: transparent;
      z-index: 1000;
    }
    .reading-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #3b82f6, #6366f1);
      transition: width 0.1s ease-out;
    }

    /* --- TOP NAVBAR --- */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 900;
      background: var(--topbar-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .topbar-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.45rem;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
      color: var(--text-accent);
      transform: translateY(-1px);
    }

    .drawer-toggle-btn {
      display: none;
    }

    /* --- APP LAYOUT --- */
    .app-container {
      display: flex;
      flex: 1;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      position: relative;
    }

    /* --- TABLE OF CONTENTS (SIDEBAR) --- */
    .sidebar {
      width: 290px;
      flex-shrink: 0;
      position: sticky;
      top: 55px;
      height: calc(100vh - 55px);
      overflow-y: auto;
      padding: 1.5rem 1rem 2rem 1.5rem;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toc-header {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .toc-filter {
      width: 100%;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .toc-filter:focus {
      border-color: var(--text-accent);
    }

    .toc-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .toc-link {
      display: block;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.88rem;
      line-height: 1.4;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 2px solid transparent;
    }

    .toc-link:hover {
      background: var(--bg-tertiary);
      color: var(--text-main);
      padding-left: 0.85rem;
    }

    .toc-link.active {
      background: var(--toc-active-bg);
      color: var(--toc-active-text);
      font-weight: 600;
      border-left-color: var(--toc-active-border);
    }

    .toc-level-1 { padding-left: 0.6rem; font-weight: 600; }
    .toc-level-2 { padding-left: 1.2rem; }
    .toc-level-3 { padding-left: 1.8rem; font-size: 0.83rem; }
    .toc-level-4 { padding-left: 2.4rem; font-size: 0.8rem; }
    .toc-level-5 { padding-left: 3.0rem; font-size: 0.78rem; }
    .toc-level-6 { padding-left: 3.6rem; font-size: 0.75rem; }

    /* --- CONTENT AREA --- */
    .content-area {
      flex: 1;
      min-width: 0;
      max-width: 900px;
      margin: 0 auto;
      padding: 2.5rem 3rem 6rem 3rem;
    }

    .note-main-title {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin-bottom: 1.5rem;
      color: var(--text-main);
    }

    /* --- CONTENT TOOLBAR (EXPAND / COLLAPSE ALL) --- */
    .content-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.6rem;
      margin-bottom: 1.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      width: fit-content;
    }

    .toolbar-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .toolbar-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
      color: var(--text-accent);
      transform: translateY(-1px);
    }

    .toolbar-btn svg {
      flex-shrink: 0;
    }

    /* --- PROPERTIES CARD --- */
    .obsidian-properties-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .properties-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .properties-toggle-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.2rem;
      border-radius: 4px;
    }

    .properties-toggle-btn:hover {
      color: var(--text-main);
    }

    .properties-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .properties-table tr {
      border-bottom: 1px solid var(--border-color);
    }

    .properties-table tr:last-child {
      border-bottom: none;
    }

    .prop-key {
      padding: 0.6rem 1rem 0.6rem 0;
      color: var(--text-muted);
      font-weight: 500;
      width: 25%;
      vertical-align: top;
    }

    .prop-value {
      padding: 0.6rem 0;
      color: var(--text-main);
    }

    .prop-tag {
      display: inline-block;
      background: var(--tag-bg);
      color: var(--tag-color);
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 0.35rem;
      margin-bottom: 0.25rem;
      text-decoration: none;
    }

    .prop-pill {
      display: inline-block;
      background: var(--bg-tertiary);
      color: var(--text-main);
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .prop-boolean.is-true { color: #16a34a; font-weight: bold; }
    .prop-boolean.is-false { color: #dc2626; font-weight: bold; }

    /* --- TYPOGRAPHY & CONTENT ELEMENTS --- */
    .markdown-body {
      font-size: 1.05rem;
      color: var(--text-main);
    }

    /* Collapsible Headings */
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      color: var(--text-main);
      font-weight: 700;
      line-height: 1.35;
      margin-top: 2.2rem;
      margin-bottom: 0.85rem;
      scroll-margin-top: 80px;
      position: relative;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      transition: color 0.15s ease;
    }

    .markdown-body h1:hover,
    .markdown-body h2:hover,
    .markdown-body h3:hover,
    .markdown-body h4:hover,
    .markdown-body h5:hover,
    .markdown-body h6:hover {
      color: var(--text-accent);
    }

    .heading-collapse-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      color: var(--text-muted);
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.25s ease, color 0.2s ease;
    }

    .markdown-body h1:hover .heading-collapse-btn,
    .markdown-body h2:hover .heading-collapse-btn,
    .markdown-body h3:hover .heading-collapse-btn,
    .markdown-body h4:hover .heading-collapse-btn,
    .markdown-body h5:hover .heading-collapse-btn,
    .markdown-body h6:hover .heading-collapse-btn {
      color: var(--text-accent);
    }

    .navigable-heading.is-collapsed .heading-collapse-btn svg {
      transform: rotate(-90deg);
    }

    .markdown-body h1 { font-size: 1.9rem; }
    .markdown-body h2 { font-size: 1.55rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; }
    .markdown-body h3 { font-size: 1.3rem; }
    .markdown-body h4 { font-size: 1.15rem; }
    .markdown-body h5 { font-size: 1.05rem; }
    .markdown-body h6 { font-size: 0.95rem; }

    .markdown-body p {
      margin-bottom: 1.25rem;
    }

    .markdown-body a {
      color: var(--text-accent);
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      transition: all 0.15s;
    }

    .markdown-body a:hover {
      color: var(--text-accent-hover);
      border-bottom-color: var(--text-accent-hover);
    }

    .markdown-body ul, .markdown-body ol {
      margin-bottom: 1.25rem;
      padding-left: 1.75rem;
    }

    .markdown-body li {
      margin-bottom: 0.4rem;
    }

    .markdown-body blockquote {
      border-left: 4px solid var(--quote-border);
      background: var(--quote-bg);
      padding: 0.85rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin-bottom: 1.25rem;
      color: var(--text-muted);
    }

    .markdown-body img, .exported-embed-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.25rem 0;
      box-shadow: var(--shadow-md);
      display: block;
    }

    .markdown-body hr {
      border: 0;
      height: 1px;
      background: var(--border-color);
      margin: 2rem 0;
    }

    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .markdown-body th, .markdown-body td {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      text-align: left;
    }

    .markdown-body th {
      background: var(--bg-secondary);
      font-weight: 600;
    }

    .markdown-body code {
      font-family: var(--font-mono);
      font-size: 0.9em;
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    .markdown-body pre {
      position: relative;
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1.25rem 0;
      overflow-x: auto;
    }

    .markdown-body pre code {
      background: transparent;
      border: none;
      padding: 0;
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .code-copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      opacity: 0.7;
      transition: all 0.2s;
    }

    .has-copy-btn:hover .code-copy-btn {
      opacity: 1;
    }

    .code-copy-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-main);
    }

    .code-copy-btn.copied {
      background: #16a34a;
      color: #ffffff;
      border-color: #16a34a;
    }

    /* --- CALLOUTS / ADMONITIONS --- */
    .callout {
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--text-accent);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 1.25rem 0;
      background: var(--bg-secondary);
    }

    .callout-title {
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    /* --- KATEX MATH RENDERING --- */
    .katex-display-wrapper {
      margin: 1.5rem 0;
      padding: 1rem 0;
      overflow-x: auto;
      text-align: center;
    }

    .katex-inline-wrapper {
      padding: 0 0.2em;
    }

    /* --- FLOATING BACK TO TOP --- */
    .back-to-top {
      position: fixed;
      bottom: 25px;
      right: 25px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s ease;
      z-index: 800;
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
    }

    .back-to-top:hover {
      background: var(--text-accent);
      color: #ffffff;
      transform: translateY(-3px);
    }

    /* --- FOOTER --- */
    .document-footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* --- RESPONSIVE & MOBILE DRAWER --- */
    @media (max-width: 900px) {
      .drawer-toggle-btn {
        display: inline-flex;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: -320px;
        width: 300px;
        height: 100vh;
        z-index: 1100;
        background: var(--bg-primary);
        box-shadow: var(--shadow-lg);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .sidebar.open {
        transform: translateX(320px);
      }

      .sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 1050;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .sidebar-backdrop.active {
        opacity: 1;
        visibility: visible;
      }

      .content-area {
        padding: 1.5rem 1.25rem 4rem 1.25rem;
      }

      .note-main-title {
        font-size: 1.8rem;
      }
    }

    /* --- PRINT STYLES --- */
    @page {
      size: A4 portrait;
      margin: 15mm 20mm;
    }

    @media print {
      *, *::before, *::after {
        box-sizing: border-box !important;
      }

      html, body {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        font-size: 11pt !important;
        line-height: 1.6 !important;
      }

      .topbar, .sidebar, .sidebar-backdrop, .back-to-top, .reading-progress-container, .btn-icon, .code-copy-btn, .document-footer, .content-toolbar, .heading-collapse-btn {
        display: none !important;
      }

      .app-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }

      .content-area {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 8mm 12mm !important;
        box-sizing: border-box !important;
      }

      .note-main-title {
        font-size: 22pt !important;
        margin-top: 0 !important;
        margin-bottom: 16pt !important;
        color: #000000 !important;
      }

      .markdown-body {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        color: #111827 !important;
      }

      /* Force all sections to be visible on print */
      .markdown-body [class*="hidden-by-"] {
        display: block !important;
      }

      .markdown-body p, .markdown-body li {
        orphans: 3;
        widows: 3;
        margin-bottom: 12pt !important;
      }

      .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
        page-break-after: avoid;
        break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-top: 20pt !important;
        margin-bottom: 10pt !important;
        padding-top: 6pt !important;
        color: #111827 !important;
      }

      .obsidian-properties-card {
        border: 1px solid #d0d7de !important;
        border-radius: 8px !important;
        background: #f8fafc !important;
        padding: 12px 16px !important;
        margin-top: 8pt !important;
        margin-bottom: 18pt !important;
        page-break-inside: avoid;
        break-inside: avoid;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .obsidian-properties-card .properties-table-container {
        display: block !important;
      }

      .properties-toggle-btn {
        display: none !important;
      }

      .prop-tag {
        background: #e0f2fe !important;
        color: #0369a1 !important;
        border-radius: 4px !important;
        padding: 2px 6px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .callout, blockquote {
        margin-top: 14pt !important;
        margin-bottom: 14pt !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      pre, table, img, .katex-display-wrapper {
        margin-top: 14pt !important;
        margin-bottom: 14pt !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      pre {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        border: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
        padding: 8px 12px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      img, .exported-embed-image {
        max-width: 100% !important;
        height: auto !important;
      }
    }

    /* KaTeX Embedded CSS */
    ${katexCss}
  </style>
</head>
<body>
  <!-- Reading Progress Bar -->
  <div class="reading-progress-container">
    <div id="progressBar" class="reading-progress-bar"></div>
  </div>

  <!-- Top Navigation Bar -->
  <header class="topbar">
    <div class="topbar-left">
      <button id="drawerToggle" class="btn-icon drawer-toggle-btn" aria-label="Abrir menú de contenidos">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <span class="topbar-title">${escapeHtml(title)}</span>
    </div>
    <div class="topbar-actions">
      <button id="themeToggle" class="btn-icon" aria-label="Cambiar modo claro/oscuro">
        <svg id="themeIconSun" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" style="display:none;">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg id="themeIconMoon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      <button onclick="window.print()" class="btn-icon" aria-label="Imprimir documento">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer Backdrop -->
  <div id="sidebarBackdrop" class="sidebar-backdrop"></div>

  <!-- Main Container -->
  <div class="app-container">
    <!-- Sidebar Table of Contents -->
    <aside id="sidebar" class="sidebar">
      <div class="toc-header">
        <span>Tabla de Contenidos</span>
      </div>
      <input type="text" id="tocSearch" class="toc-filter" placeholder="Filtrar secciones..." aria-label="Filtrar índice" />
      <nav class="toc-list" id="tocList">
        ${tocItemsHtml.length > 0 ? tocItemsHtml : '<span style="color:var(--text-muted); font-size:0.85rem;">No hay encabezados</span>'}
      </nav>
    </aside>

    <!-- Content Area -->
    <main class="content-area">
      <h1 class="note-main-title">${escapeHtml(title)}</h1>
      ${propertiesHtml}

      <!-- Document Folding Toolbar -->
      <div class="content-toolbar">
        <button id="expandAllBtn" class="toolbar-btn" title="Expandir todas las secciones">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="7 11 12 6 17 11"></polyline>
            <polyline points="7 18 12 13 17 18"></polyline>
          </svg>
          <span>Expandir Todo</span>
        </button>
        <button id="collapseAllBtn" class="toolbar-btn" title="Contraer todas las secciones">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
          <span>Contraer Todo</span>
        </button>
      </div>

      <div class="markdown-body" id="markdownBody">
        ${bodyContent}
      </div>
      <footer class="document-footer">
        <p>Exportado con <strong>Navigable HTML Export</strong> para Obsidian</p>
      </footer>
    </main>
  </div>

  <!-- Floating Back to Top Button -->
  <button id="backToTop" class="back-to-top" aria-label="Volver arriba">
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  </button>

  <!-- Client-side Logic (Vanilla JS) -->
  <script>
    // --- 1. THEME MANAGER ---
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const iconSun = document.getElementById('themeIconSun');
    const iconMoon = document.getElementById('themeIconMoon');

    function applyTheme(theme) {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlEl.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        htmlEl.setAttribute('data-theme', theme);
      }
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      iconSun.style.display = isDark ? 'block' : 'none';
      iconMoon.style.display = isDark ? 'none' : 'block';
    }

    const savedTheme = localStorage.getItem('obsidian_html_theme') || '${settings.defaultTheme}';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('obsidian_html_theme', nextTheme);
      applyTheme(nextTheme);
    });

    // --- 2. READING PROGRESS & BACK TO TOP ---
    const progressBar = document.getElementById('progressBar');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      if (progressBar) progressBar.style.width = scrolled + '%';

      if (winScroll > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 3. MOBILE DRAWER ---
    const drawerToggle = document.getElementById('drawerToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    function toggleDrawer(open) {
      if (open) {
        sidebar.classList.add('open');
        backdrop.classList.add('active');
      } else {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      }
    }

    if (drawerToggle) {
      drawerToggle.addEventListener('click', () => toggleDrawer(true));
      backdrop.addEventListener('click', () => toggleDrawer(false));
    }

    // --- 4. TOC SEARCH FILTER ---
    const tocSearch = document.getElementById('tocSearch');
    const tocLinks = document.querySelectorAll('.toc-link');

    if (tocSearch) {
      tocSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        tocLinks.forEach(link => {
          const text = link.textContent.toLowerCase();
          link.style.display = text.includes(query) ? 'block' : 'none';
        });
      });
    }

    // --- 5. SCROLL-SPY FOR TOC ---
    const headings = document.querySelectorAll('.navigable-heading');
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -65% 0px',
      threshold: 0
    };

    let activeId = '';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeId = entry.target.getAttribute('id');
          updateActiveToc(activeId);
        }
      });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));

    function updateActiveToc(id) {
      if (!id) return;
      tocLinks.forEach(link => {
        if (link.getAttribute('data-target') === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    tocLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          toggleDrawer(false);
        }
      });
    });

    // --- 6. CODE BLOCK COPY BUTTON ---
    document.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pre = btn.parentElement;
        const code = pre.querySelector('code');
        if (code) {
          await navigator.clipboard.writeText(code.innerText);
          btn.classList.add('copied');
          btn.querySelector('span').textContent = '¡Copiado!';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.querySelector('span').textContent = 'Copiar';
          }, 2000);
        }
      });
    });

    // --- 7. PROPERTIES COLLAPSE ---
    window.toggleProperties = function(btn) {
      const container = btn.closest('.obsidian-properties-card').querySelector('.properties-table-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        btn.querySelector('svg').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    };

    // --- 8. COLLAPSIBLE HEADINGS & FOLDING LOGIC ---
    function getHeadingLevel(el) {
      if (!el || !/^H[1-6]$/i.test(el.tagName)) return 7;
      const levelAttr = el.getAttribute('data-heading-level');
      return levelAttr ? parseInt(levelAttr, 10) : parseInt(el.tagName.substring(1), 10);
    }

    function toggleHeadingCollapse(headingEl, forceState) {
      const currentLevel = getHeadingLevel(headingEl);
      const isCurrentlyCollapsed = headingEl.classList.contains('is-collapsed');
      const shouldCollapse = forceState !== undefined ? forceState : !isCurrentlyCollapsed;
      const hideClass = 'hidden-by-' + headingEl.id;

      if (shouldCollapse) {
        headingEl.classList.add('is-collapsed');
      } else {
        headingEl.classList.remove('is-collapsed');
      }

      let sibling = headingEl.nextElementSibling;
      while (sibling) {
        if (/^H[1-6]$/i.test(sibling.tagName)) {
          const sibLevel = getHeadingLevel(sibling);
          if (sibLevel <= currentLevel) {
            break; // Stop at next heading of equal or higher level
          }
        }

        if (shouldCollapse) {
          sibling.classList.add(hideClass);
          sibling.style.display = 'none';
        } else {
          sibling.classList.remove(hideClass);
          // Only show element if not hidden by another parent collapse
          const isStillHidden = Array.from(sibling.classList).some(c => c.startsWith('hidden-by-'));
          if (!isStillHidden) {
            sibling.style.display = '';
          }
        }

        sibling = sibling.nextElementSibling;
      }
    }

    // Attach click listeners to headings
    headings.forEach(heading => {
      heading.addEventListener('click', (e) => {
        // Prevent collapsing when clicking on a link inside heading
        if (e.target.tagName === 'A') return;
        toggleHeadingCollapse(heading);
      });
    });

    // Expand All / Collapse All Buttons
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');

    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        headings.forEach(h => toggleHeadingCollapse(h, false));
      });
    }

    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => {
        // Collapse from top to bottom
        headings.forEach(h => toggleHeadingCollapse(h, true));
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
