module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    'airbnb',
    'prettier',
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  rules: {
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'linebreak-style': 0,
    'no-underscore-dangle': 0,
    'no-console': 0,
    'no-alert': 0,
    'no-plusplus': 0,
    'no-minusminus': 0,
    'no-param-reassign': 0,
    "no-shadow": "off",

    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],

    'react/no-unstable-nested-components': [
      'error',
      { allowAsProps: true },
    ],
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx", ".jsx"],
      },
    ],

    'react/jsx-no-bind': 0,
    'react-hooks/exhaustive-deps': 0,
    'react/prop-types': 0,
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off",
    "react-hooks/rules-of-hooks": "error",

    "react/no-unknown-property": 0,
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-unused-vars": "error",
  },
};
