import { escapeHTML as e } from './dom.js';

export function detailTemplate(font, total) {
  return `<div class="row"><div class="col-sm-12"><h1 id="font-title">${e(font.family)}<br><small>${e(font.category)}</small></h1></div></div>
  <div class="row"><div class="col-sm-6"><h5>${font.variants.length} styles <small>${font.variants.map(v => e(v.id)).join(', ')}</small></h5>
  <h5>${font.subsets.length} charsets <small>${font.subsets.map(e).join(', ')}</small></h5></div>
  <div class="col-sm-6"><h5>Rank ${font.popularity} <small>in popularity of ${total} fonts in total</small></h5>
  <h5>Last modified ${e(font.lastModified)} <small>(${e(font.version)})</small></h5></div></div>
  <hr><h4>1. Select charsets: <small>(default is <code>${e(font.defSubset)}</code>)</small></h4>
  <div class="subsetGroup" id="subsets">${font.subsets.map(subset => `<label class="checkbox-inline"><input type="checkbox" value="${e(subset)}"${font.subsetMap[subset] ? ' checked' : ''}>${e(subset)}</label>`).join('')}</div>
  <p id="customizing" class="small" role="status" hidden></p>
  <div id="font-controls"><hr><h4>2. Select styles: <small>(default is <code>${e(font.defVariant)}</code>)</small></h4>
  <div id="fontStyleControl" class="form-inline folderPrefixBar"><div class="row"><div class="col-xs-5"><div id="previewFontSizeInput" class="input-group">
  <label class="input-group-addon" for="preview-size">Preview size</label><input id="preview-size" class="form-control input-sm" type="number" min="1" max="300" value="16"><span class="input-group-addon">px</span></div></div>
  <div class="col-xs-5"><div class="btn-group"><button id="size-down" class="btn btn-default btn-sm" aria-label="Decrease preview size">-</button><button id="size-up" class="btn btn-default btn-sm" aria-label="Increase preview size">+</button></div><span class="text-muted"> Sample text editable.</span></div></div></div>
  <div id="fontStylePreviewChooser">${font.variants.map(v => `<dl class="dl-horizontal variantList"><dt><label class="checkbox-inline"><input type="checkbox" value="${e(v.id)}"${v.id === font.defVariant ? ' checked' : ''}>${e(v.id)}</label></dt><dd><p contenteditable="plaintext-only" role="textbox" aria-label="Preview ${e(v.id)}" data-variant="${e(v.id)}">The quick brown fox jumps over the lazy dog.</p></dd></dl>`).join('')}</div>
  <div class="fontItemCSSWrap"><h4>3. Copy CSS: <small>(default is <code>Modern Browsers</code>)</small></h4>
  <ul class="nav nav-pills" id="support-tabs" role="tablist" aria-label="Browser support">
  ${[['modern', 'Modern Browsers'], ['legacy', 'Legacy Support'], ['historic', 'Historic Support']].map(([id, label], i) => `<li class="${i ? '' : 'active'}" role="presentation"><button class="support-tab" id="tab-${id}" role="tab" aria-controls="css-panel" aria-selected="${!i}" tabindex="${i ? '-1' : '0'}" data-mode="${id}">${label}</button></li>`).join('')}</ul>
  <section role="tabpanel" id="css-panel" aria-labelledby="tab-modern"><p class="small" id="support-description"></p>
  <div class="cssCodeStyle" id="css-code" tabindex="0" role="region" aria-label="Generated CSS"><pre><code></code></pre></div>
  <div class="form-inline folderPrefixBar small"><label for="folder-prefix">Customize folder prefix (optional): </label><div class="form-group"><input id="folder-prefix" class="form-control input-sm" type="text" maxlength="1000" value="../fonts/" placeholder="no folder prefix"></div></div>
  <p class="small">Click on code to select all statements, then copy/paste it into your own CSS file.</p></section></div>
  <hr><h4>4. Download files:</h4><p id="download-description"></p>
  <a id="download" target="_blank" rel="noopener" class="btn btn-primary download-button"><i class="fa fa-download fa-lg" aria-hidden="true"></i><br>${e(font.id)}-${e(font.version)}-${e(font.storeID)}.zip</a>
  <p><small>Fonts are copyright of their respective authors.<br><b>See <a target="_blank" rel="noopener" href="https://fonts.google.com/attribution">Google Fonts Open Source Font Attribution</a> to find out the specific license that this font uses.</b></small></p>
  <hr><h4>You are now ready to self-host ${e(font.family)}.<br><small>If this service has actually been helpful for you, please <a href="https://github.com/majodev/google-webfonts-helper/" target="_blank" rel="noopener">star it on GitHub</a>. If you've encountered serious problems, file an issue <a href="https://github.com/majodev/google-webfonts-helper/issues">here</a>.<br>❤️ <a href="https://github.com/sponsors/majodev" target="_blank" rel="noopener">You can help to keep this project alive by sponsoring me.</a> Thank you ❤️.</small></h4><hr></div>`;
}
