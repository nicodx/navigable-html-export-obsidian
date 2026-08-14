export function renderPropertiesHtml(
  frontmatter: Record<string, unknown> | undefined,
  excludedKeys: string[] = []
): string {
  if (!frontmatter || typeof frontmatter !== 'object') {
    return '';
  }

  const entries = Object.entries(frontmatter).filter(
    ([key]) => !excludedKeys.includes(key.toLowerCase()) && key !== 'position'
  );

  if (entries.length === 0) {
    return '';
  }

  let html = `<div class="obsidian-properties-card">
    <div class="properties-header">
      <div class="properties-title">
        <svg class="properties-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>
        </svg>
        <span>Propiedades del Documento</span>
      </div>
      <button class="properties-toggle-btn" onclick="toggleProperties(this)" aria-label="Colapsar propiedades">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div class="properties-table-container">
      <table class="properties-table">
        <tbody>`;

  for (const [key, value] of entries) {
    const formattedKey = escapeHtml(formatKeyName(key));
    const formattedValue = formatPropertyValue(key, value);

    html += `
          <tr>
            <td class="prop-key">${formattedKey}</td>
            <td class="prop-val">${formattedValue}</td>
          </tr>`;
  }

  html += `
        </tbody>
      </table>
    </div>
  </div>`;

  return html;
}

function formatKeyName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatPropertyValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return '<span class="prop-empty">—</span>';
  }

  if (key.toLowerCase() === 'tags' || key.toLowerCase() === 'tag') {
    const tagsArray: string[] = Array.isArray(value) ? (value as string[]) : String(value).split(/[\s,]+/);
    return `<div class="prop-tags-wrapper">` + tagsArray
      .filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
      .map((t: string) => {
        const cleanTag = String(t).replace(/^#/, '').trim();
        return `<span class="prop-tag">#${escapeHtml(cleanTag)}</span>`;
      })
      .join('') + `</div>`;
  }

  if (Array.isArray(value)) {
    return `<div class="prop-list">` + value
      .map((v: unknown) => `<span class="prop-list-item">${escapeHtml(String(v))}</span>`)
      .join(', ') + `</div>`;
  }

  if (typeof value === 'boolean') {
    return `<span class="prop-boolean ${value ? 'is-true' : 'is-false'}">${value ? '✓ Sí' : '✗ No'}</span>`;
  }

  const str = String(value);
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return `<a href="${escapeHtml(str)}" target="_blank" rel="noopener noreferrer" class="prop-link">${escapeHtml(str)}</a>`;
  }

  return `<span class="prop-text">${escapeHtml(str)}</span>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
