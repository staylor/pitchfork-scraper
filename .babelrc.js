module.exports = {
  presets: ['babel-preset-kyt-react'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
    'kyt-runtime/babel',
    [
      'module-resolver',
      {
        root: ['./src'],
      },
    ],
  ],
  env: {
    production: {
      plugins: [['pretty-lights/babel', { hoist: true }]],
    },
    development: {
      plugins: [['pretty-lights/babel', { sourceMap: true, autoLabel: true }]],
    },
    test: {
      plugins: [['pretty-lights/babel', { hoist: true, autoLabel: true }]],
    },
  },
};
