module.exports = {
  extends: ['eslint-config-kyt'],

  rules: {
    'no-underscore-dangle': ['error', { allow: ['__typename', '__emotion', '__APOLLO_STATE__'] }],
    'react/destructuring-assignment': 'off',
    'react/no-danger': 0,
  },

  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
