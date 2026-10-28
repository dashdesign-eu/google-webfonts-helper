import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fontCSS, downloadURL, cssString } from '../../client/native/css-code.js';
import { detailTemplate } from '../../client/native/detail-template.js';
import { escapeHTML, safeExternal } from '../../client/native/dom.js';

const variants = [{ id: 'regular', fontFamily: "'Arvo'", fontWeight: '400', fontStyle: 'normal', svg: 'https://fonts.gstatic.com/font.svg#Arvo' },
  { id: '700italic', fontFamily: "'Arvo'", fontWeight: '700', fontStyle: 'italic', svg: 'https://fonts.gstatic.com/font.svg#Arvo' }];
const font = { id: 'arvo', family: 'Arvo', version: 'v20', storeID: 'latin_latin-ext', variants,
  subsets: ['latin', 'latin-ext'], subsetMap: { latin: true, 'latin-ext': true }, defSubset: 'latin', defVariant: 'regular', popularity: 1, category: 'serif', lastModified: '2022-09-22' };

test('modern CSS and ZIP agree on selected styles, subsets, prefix and WOFF2', () => {
  const css = fontCSS(font, [variants[1]], 'modern', '../fonts/');
  assert.match(css, /font-style: italic;/); assert.match(css, /font-weight: 700;/);
  assert.match(css, /\.\.\/fonts\/arvo-v20-latin_latin-ext-700italic\.woff2/);
  assert.doesNotMatch(css, /\.ttf|\.eot|\.svg|\.woff'/);
  const url = new URL(downloadURL(font, [variants[1]], 'modern'), 'https://example.test');
  assert.equal(url.searchParams.get('variants'), '700italic');
  assert.equal(url.searchParams.get('subsets'), 'latin,latin-ext');
  assert.equal(url.searchParams.get('formats'), 'woff2');
});

test('legacy and historic CSS preserve all original format options and SVG fragments', () => {
  const legacy = fontCSS(font, variants, 'legacy', '');
  assert.equal((legacy.match(/^@font-face \{/gm) || []).length, 2);
  assert.match(legacy, /format\('truetype'\)/); assert.doesNotMatch(legacy, /embedded-opentype/);
  const historic = fontCSS(font, [variants[0]], 'historic', '../');
  for (const type of ['embedded-opentype', 'woff2', 'woff', 'truetype', 'svg']) assert.ok(historic.includes(`format('${type}')`));
  assert.match(historic, /\.eot\?\#iefix/); assert.match(historic, /\.svg#Arvo/);
});

test('untrusted API labels and folder prefixes remain literal text', () => {
  assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  const html = detailTemplate({ ...font, family: '<script>alert(1)</script>' }, 1);
  assert.doesNotMatch(html, /<script>/); assert.match(html, /&lt;script&gt;/);
  assert.equal(cssString("a'\n"), "a\\'\\a ");
  assert.equal(safeExternal('javascript:alert(1)'), null);
  assert.equal(safeExternal('https://evil.test/x', 'fonts.gstatic.com'), null);
  assert.equal(safeExternal('https://fonts.gstatic.com/a.woff2', 'fonts.gstatic.com'), 'https://fonts.gstatic.com/a.woff2');
});
