// Small, non-executing CSS presentation. Tokens are text nodes; font names and
// user folder prefixes can never create markup, styles or event handlers.
export function renderCSS(code, text) {
  const token = /\/\*[\s\S]*?\*\/|'(?:[^'\\]|\\.)*'|@font-face|[a-z-]+(?=\s*:)/g;
  const fragment = document.createDocumentFragment();
  let end = 0;
  for (const match of text.matchAll(token)) {
    fragment.append(document.createTextNode(text.slice(end, match.index)));
    const span = document.createElement('span');
    span.className = match[0].startsWith('/*') ? 'hljs-comment' : match[0].startsWith("'") ? 'hljs-string' : match[0].startsWith('@') ? 'hljs-keyword' : 'hljs-attribute';
    span.textContent = match[0]; fragment.append(span); end = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(end))); code.replaceChildren(fragment);
}
