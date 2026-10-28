import { $, all, selectText, safeExternal } from './dom.js';
import { detailTemplate } from './detail-template.js';
import { fontCSS, downloadURL, formats } from './css-code.js';
import { renderCSS } from './highlight.js';

export function showDetail(font, total, previous, changeSubsets) {
  const state = previous?.id === font.id ? previous : { id: font.id, selected: new Set([font.defVariant]), mode: 'modern', prefix: '../fonts/', size: 16, samples: {} };
  $('#font-detail').innerHTML = detailTemplate(font, total);
  const previews = all('[data-variant]');
  const faces = [];
  for (const variant of font.variants) {
    const preview = previews.find(p => p.dataset.variant === variant.id);
    const family = `preview-${font.id}-${variant.id}`;
    preview.style.fontFamily = `"${family}", sans-serif`;
    preview.style.fontWeight = variant.fontWeight;
    preview.style.fontStyle = variant.fontStyle;
    if (state.samples[variant.id]) preview.textContent = state.samples[variant.id];
    preview.addEventListener('input', () => { state.samples[variant.id] = preview.textContent; });
    const url = safeExternal(variant.woff2, 'fonts.gstatic.com');
    if (url) {
      const face = new FontFace(family, `url(${JSON.stringify(url)})`, { weight: variant.fontWeight, style: variant.fontStyle, display: 'swap' });
      document.fonts.add(face); faces.push(face);
      face.load().catch(() => {}); // Native fallback remains usable if Google is offline.
    }
  }
  const titleVariant = font.variants.find(variant => variant.id === font.defVariant) || font.variants[0];
  $('#font-title').style.fontFamily = `"preview-${font.id}-${titleVariant.id}", 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  $('#font-title').style.fontWeight = '400';
  const styleInputs = all('#fontStylePreviewChooser input');
  styleInputs.forEach(input => { input.checked = state.selected.has(input.value); });
  if (!styleInputs.some(input => input.checked)) {
    styleInputs.find(input => input.value === font.defVariant).checked = true;
    state.selected = new Set([font.defVariant]);
  }
  function enforceMinimum(inputs) {
    const selected = inputs.filter(input => input.checked);
    inputs.forEach(input => { input.disabled = selected.length === 1 && input.checked; });
  }
  function refresh() {
    enforceMinimum(styleInputs);
    const variants = font.variants.filter(v => state.selected.has(v.id));
    renderCSS($('#css-code code'), fontCSS(font, variants, state.mode, state.prefix));
    $('#download').href = downloadURL(font, variants, state.mode);
    $('#download-description').textContent = `Your generated archive for ${font.family} with charsets [${font.storeID.replace(/_/g, ',')}] and styles [${variants.map(v => v.id).join(',')}] includes the formats [${formats[state.mode].join(',')}].`;
    const label = $(`#tab-${state.mode}`).textContent;
    $('#support-description').textContent = `Choose ${label} ${state.mode === 'modern' ? 'if supporting old browsers is not relevant' : 'if old browsers still need to be supported'}. Formats in this snippet: [${formats[state.mode].join(',')}]`;
    $('#css-panel').setAttribute('aria-labelledby', `tab-${state.mode}`);
    all('.support-tab').forEach(tab => {
      const active = tab.dataset.mode === state.mode;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      tab.parentElement.classList.toggle('active', active);
    });
  }
  styleInputs.forEach(input => input.addEventListener('change', () => {
    state.selected = new Set(styleInputs.filter(input => input.checked).map(input => input.value)); refresh();
  }));
  const subsets = all('#subsets input'); enforceMinimum(subsets);
  subsets.forEach(input => input.addEventListener('change', () => {
    enforceMinimum(subsets);
    changeSubsets(subsets.filter(input => input.checked).map(input => input.value));
  }));
  $('#folder-prefix').value = state.prefix;
  $('#folder-prefix').addEventListener('input', event => { state.prefix = event.target.value; refresh(); });
  $('#css-code').addEventListener('click', event => selectText(event.currentTarget));
  $('#css-code').addEventListener('keydown', event => { if (event.key === 'Enter') selectText(event.currentTarget); });
  const tabs = all('.support-tab');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { state.mode = tab.dataset.mode; refresh(); });
    tab.addEventListener('keydown', event => {
      const positions = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (positions[event.key] !== undefined) { event.preventDefault(); tabs[positions[event.key]].click(); tabs[positions[event.key]].focus(); }
    });
  });
  function resize(size) {
    state.size = Math.max(1, Math.min(300, Number(size) || 16));
    $('#preview-size').value = state.size;
    previews.forEach(preview => { preview.style.fontSize = `${state.size}px`; });
  }
  $('#preview-size').addEventListener('input', event => resize(event.target.value));
  $('#size-down').addEventListener('click', () => resize(state.size - 1));
  $('#size-up').addEventListener('click', () => resize(state.size + 1));
  resize(state.size); refresh();
  return { state, cleanup: () => faces.forEach(face => document.fonts.delete(face)) };
}
