import virtualizedCSS from 'public/virtualized.css';

const assets =
  process.env.NODE_ENV === 'production'
    ? // eslint-disable-next-line
      require(KYT.ASSETS_MANIFEST)
    : { 'main.js': 'http://localhost:3001/main.js' };
const scripts = ['runtime', 'vendor', 'main']
  .map(name => assets[`${name}.js`] || '')
  .filter(Boolean);

export default ({ ids, css, html, initialState: state }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" }
</style>
<link rel="stylesheet" href="${virtualizedCSS}" />
<style data-lights-css="${ids.join(' ')}">${css}</style>
</head>
<body>
  <main id="main">${html}</main>
  <script>window.__APOLLO_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')};</script>
  ${scripts.map(src => `<script defer src="${src}"></script>`).join('')}
</body>
</html>
`;
