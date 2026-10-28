# Fonts security migration, 29 October 2026

The inherited 2014 Bower/Grunt build installed deprecated archive/image plugins,
old Lodash/Underscore and multiple vulnerable request chains. Updating only the
Node runtime could not remove those dependencies. The native ES-module client
replaces that chain and the unsupported AngularJS/jQuery browser runtime.

## Preserved contract

- Existing `/fonts`, `/fonts/:id`, JSON API, query parameters, filenames and ZIP
  content remain available. Server font fetching, cache and Google integration
  are retained; no production key is copied into frontend output.
- Font search, all six sort orders/reversal, deep links and back/forward work.
- Charset batching stays at three seconds. A last selected charset or variant
  cannot be removed. Superseded requests are aborted and stale results ignored.
- All variants retain editable real-font previews and size controls. The three
  original CSS modes and folder prefixes determine the same ZIP formats.
- Existing copy, two independently scrolling columns, 55px header, Bootstrap
  geometry, icons and sponsor links remain. CSS-only legacy styling is preserved
  in `client/static/app/base.css`, originally `app/1ecbaa5b.app.css`, SHA256
  `fa27cd7644d8dff2c79ff0bf661a3896cb794731f368414f419c746ee780f8b7`.
  This is a retained generated visual asset, not a hidden JavaScript dependency.
  No Bootstrap, Angular, Highlight.js or jQuery executable code ships. Icon and
  background file hashes are in `preserved-css-assets-2026-10-28.json`; license
  notices are in `licenses/`. The existing desktop minimum width is preserved.
- DOM text/attributes escape remote labels; CSS snippets are text-only. Preview
  FontFace URLs require HTTPS on fonts.gstatic.com. Optional sponsors failing
  never block the tool. API failures have a retry control and keep navigation.

## Build and verification

`npm ci` uses the committed lockfile. The build compiles TypeScript and bundles
only native client modules with esbuild. It replaces only generated `dist/`.
Production font-cache locations are not deleted by that build. The previous
unused Grunt/Bower orchestration and Angular sources have been removed.

- Maintained Node 24.22.1, TypeScript 6.0.3 (within parser peer range), ESLint10.
- Lodash4.18.1 and decode-uri-component0.5.1 replace new advisory matches;
  file-type22.2.0 retains the actual font binary/ZIP verification tests.
- Full dependency audit: zero findings, including development dependencies.
- Lint and strict typecheck pass; all 27 existing API tests and three focused
  client regressions pass. Chromium exercises real server selection, history,
  sorting, editing, all CSS modes, failure recovery and an actual ZIP download.
- Desktop visual comparison uses the running old service and the built client
  at1200px; fixture metadata has3 fonts/version20 versus1960/current live fonts,
  so counts, rank and font versions in fixture images intentionally differ.

An audit result alone is not a live deployment or a refreshed Dependency-Track
result. The release must be merged through GitHub, deployed via Coolify, checked
on the public font/ZIP API and reimported before remaining risk is reported.

## Coolify healthcheck compatibility

The production slim image explicitly includes curl because the existing Coolify
healthcheck runs curl/wget against `/-/healthy`. A rollout correctly refused a
healthy switch when both clients were absent; the previous deployment remained
available. Keep this client installed and verify the actual healthcheck inside
the production image before future slim-image changes.
