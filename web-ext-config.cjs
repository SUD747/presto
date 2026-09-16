// Everything that is not the extension itself. Keeps `web-ext build` output to
// exactly the files the browser loads.
module.exports = {
  artifactsDir: 'dist',
  ignoreFiles: [
    'test', 'test/**',
    'docs', 'docs/**',
    '.github', '.github/**',
    'icons/icon.svg',
    'web-ext-config.cjs',
    'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'SECURITY.md',
  ],
};
