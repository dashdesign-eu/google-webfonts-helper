# Minimal production runtime

The compiled font service starts directly with Node under tini as the existing
node user. npm, corepack and Yarn are build tools, unused by the running service.
Remove their real code and bundled vulnerable dependencies. Keep all app files,
Node, entrypoint, user and image configuration identical to the qualified parent.
Verify exact hashes, complete image scan and the real public app after publishing.
