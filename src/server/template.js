import virtualizedCSS from 'public/virtualized.css';

const getDeferScript = src => `<script defer src="${src}"></script>`;

export default ({ ids, css, html, bundles, initialState: state }) => `
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
  ${bundles.runtimeBundle ? getDeferScript(bundles.runtimeBundle) : ''}
  ${bundles.vendorBundle ? getDeferScript(bundles.vendorBundle) : ''}
  ${bundles.scripts.map(getDeferScript).join('\n')}
  ${bundles.entryBundle ? getDeferScript(bundles.entryBundle) : ''}
</body>
</html>
`;
