export const $ = (selector, root = document) => root.querySelector(selector);
export const all = (selector, root = document) => [...root.querySelectorAll(selector)];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,
  char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function selectText(element) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export async function jsonRequest(url, signal) {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  return response.json();
}

export function safeExternal(value, allowedHost) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (!allowedHost || url.hostname === allowedHost) ? url.href : null;
  } catch { return null; }
}
