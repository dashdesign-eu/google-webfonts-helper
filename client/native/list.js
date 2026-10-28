import { $, escapeHTML } from './dom.js';

const orders = {
  family: { label: 'by family', compare: (a, b) => a.family.localeCompare(b.family), detail: f => f.category },
  category: { label: 'by category', compare: (a, b) => a.category.localeCompare(b.category), detail: f => f.category },
  popularity: { label: 'by popularity', compare: (a, b) => a.popularity - b.popularity, detail: f => `Rank ${f.popularity}` },
  modified: { label: 'by last modified', compare: (a, b) => b.lastModified.localeCompare(a.lastModified), detail: f => f.lastModified },
  styles: { label: 'by # styles', compare: (a, b) => b.variants.length - a.variants.length, detail: f => `${f.variants.length} styles` },
  charsets: { label: 'by # charsets', compare: (a, b) => b.subsets.length - a.subsets.length, detail: f => `${f.subsets.length} charsets` }
};

export function setupList(fonts, selectedId) {
  let order = 'family', reversed = false;
  const input = $('#searchinput'), container = $('#font-list');
  function render(reset = false) {
    const term = input.value.trim().toLocaleLowerCase();
    const predicate = orders[order];
    input.placeholder = `${fonts.length} fonts ${predicate.label}`;
    $('#searchclear').hidden = !input.value;
    const rows = fonts.filter(f => [f.family, f.id, f.category, ...f.subsets].join(' ').toLocaleLowerCase().includes(term));
    rows.sort((a, b) => (predicate.compare(a, b) || a.family.localeCompare(b.family)) * (reversed ? -1 : 1));
    container.innerHTML = rows.map(font => `<a href="/fonts/${encodeURIComponent(font.id)}?subsets=${encodeURIComponent(font.defSubset)}" class="list-group-item${selectedId() === font.id ? ' active' : ''}"${selectedId() === font.id ? ' aria-current="page"' : ''}><h5 class="list-group-item-heading">${escapeHTML(font.family)} <small>${escapeHTML(predicate.detail(font))}</small></h5></a>`).join('');
    if (!rows.length) container.textContent = 'No fonts match your search.';
    if (reset) $('.scrollerLeft').scrollTop = 0;
  }
  input.addEventListener('input', () => render(true));
  $('#searchclear').addEventListener('click', () => { input.value = ''; render(true); input.focus(); });
  $('#font-order').addEventListener('change', event => { order = event.target.value; render(true); });
  $('#reverse-order').addEventListener('click', event => {
    reversed = !reversed;
    event.currentTarget.setAttribute('aria-pressed', String(reversed));
    render(true);
  });
  render();
  return render;
}
