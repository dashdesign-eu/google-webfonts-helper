export const formats = { modern: ['woff2'], legacy: ['woff2', 'ttf'], historic: ['eot', 'woff2', 'woff', 'ttf', 'svg'] };
const typeNames = { eot: 'embedded-opentype', woff2: 'woff2', woff: 'woff', ttf: 'truetype', svg: 'svg' };
// Text goes into textContent, never HTML or executable CSS. Escape CSS strings so
// a pasted folder prefix still produces a literal URL rather than a declaration.
export function cssString(value) {
  return String(value).replace(/[\\'\n\r\f]/g, c => c === "'" || c === '\\' ? '\\' + c : '\\' + c.charCodeAt(0).toString(16) + ' ');
}

export function fontCSS(font, variants, mode, prefix) {
  return variants.map(variant => {
    const base = `${prefix}${font.id}-${font.version}-${font.storeID}-${variant.id}`;
    const urls = formats[mode].map(format => {
      let suffix = format === 'eot' ? '?#iefix' : '';
      if (format === 'svg') suffix = '#' + String(variant.svg || '').split('#')[1];
      return `url('${cssString(base + '.' + format + suffix)}') format('${typeNames[format]}')`;
    });
    const lines = [`/* ${font.id}-${variant.id} - ${font.storeID} */`, '@font-face {',
      '  font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */',
      `  font-family: '${cssString(font.family)}';`, `  font-style: ${variant.fontStyle};`,
      `  font-weight: ${variant.fontWeight};`];
    if (mode === 'historic') lines.push(`  src: url('${cssString(base + '.eot')}'); /* IE9 Compat Modes */`);
    lines.push(`  src: ${urls.join(',\n       ')};`, '}');
    return lines.join('\n');
  }).join('\n\n') + '\n';
}

export function downloadURL(font, variants, mode) {
  const params = new URLSearchParams({ download: 'zip', subsets: font.storeID.replace(/_/g, ','),
    variants: variants.map(v => v.id).join(','), formats: formats[mode].join(',') });
  return `/api/fonts/${encodeURIComponent(font.id)}?${params}`;
}
