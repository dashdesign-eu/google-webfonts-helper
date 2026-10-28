import { $, jsonRequest, safeExternal } from './dom.js';
import { setupList } from './list.js';
import { showDetail } from './detail.js';

const home = $('#home-template').innerHTML;
let fonts = [], selectedId = '', refreshList = () => {}, detail, request, subsetTimer;

async function navigate() {
  clearTimeout(subsetTimer); request?.abort(); request = new AbortController();
  const activeRequest = request;
  const id = location.pathname.match(/^\/fonts\/([^/]+)\/?$/)?.[1];
  selectedId = id ? decodeURIComponent(id) : ''; refreshList();
  $('#request-error').hidden = true;
  $('#loading-status').hidden = true;
  $('#font-detail').setAttribute('aria-busy', String(Boolean(id)));
  if (!id) { detail?.cleanup(); detail = undefined; $('#font-detail').innerHTML = home; return; }
  $('#loading-status').hidden = false;
  $('#loading-status').textContent = `Loading ${selectedId}...`;
  try {
    const subsets = new URLSearchParams(location.search).get('subsets') || '';
    const font = await jsonRequest(`/api/fonts/${encodeURIComponent(selectedId)}?${new URLSearchParams({ subsets })}`, request.signal);
    if (activeRequest !== request) return;
    detail?.cleanup();
    detail = showDetail(font, fonts.length, detail?.state, values => {
      clearTimeout(subsetTimer);
      $('#customizing').hidden = false; $('#customizing').textContent = 'Customization will be requested in 3 sec...';
      // Retain the previous request grouping interval; rapid checkbox changes
      // never start concurrent font archive generation on the server.
      subsetTimer = setTimeout(() => {
        const next = new URL(location.href); next.searchParams.set('subsets', values.join(','));
        history.pushState(null, '', next); navigate();
      }, 3000);
    });
  } catch (error) {
    if (error.name === 'AbortError' || activeRequest !== request) return;
    $('#error-message').textContent = error.message;
    $('#request-error').hidden = false;
  } finally {
    if (activeRequest === request) { $('#loading-status').hidden = true; $('#font-detail').setAttribute('aria-busy', 'false'); }
  }
}

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || !/^\/(fonts(?:\/[^/]+)?\/?)?$/.test(url.pathname)) return;
  event.preventDefault(); history.pushState(null, '', url); navigate();
});
window.addEventListener('popstate', navigate);
$('#retry-request').addEventListener('click', () => fonts.length ? navigate() : start());

async function start() {
  try {
    fonts = await jsonRequest('/api/fonts');
    if (!Array.isArray(fonts)) throw new Error('The font list could not be read. Please try again.');
    refreshList = setupList(fonts, () => selectedId);
    await navigate();
  } catch (error) { $('#error-message').textContent = error.message; $('#request-error').hidden = false; }
}

async function sponsors() {
  try {
    const data = await jsonRequest('https://sponsors.mranftl.com/json');
    for (const sponsor of data.sponsors || []) {
      const imageURL = safeExternal(sponsor.url);
      if (!imageURL || !/^[a-z\d-]+$/i.test(sponsor.login)) continue;
      const link = document.createElement('a'); link.href = `https://github.com/${sponsor.login}`;
      link.className = `btn btn-default actSponsorButton actSponsorButton${sponsor.type === 'Organization' ? 'Organization' : 'User'}`;
      link.title = sponsor.login; link.target = '_blank'; link.rel = 'noopener';
      const img = document.createElement('img'); img.className = 'sponsor-img'; img.alt = sponsor.login; img.src = imageURL;
      link.append(img); $('#sponsors').append(link);
    }
  } catch { /* Optional remote sponsor listing never blocks font selection. */ }
}

start(); sponsors();
