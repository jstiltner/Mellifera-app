module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  ignorePatterns: ['dist/', 'node_modules'],

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  overrides: [
    {
      files: ['test/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: { 'jest/prefer-expect-assertions': 'off' },
    },
  ],
  rules: {
    indent: ['error', 2],
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier', 'jest'],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'no-unused-vars': 'off',
  },
  settings: {
    jest: {
      globalAliases: {
        describe: ['context'],
        fdescribe: ['fcontext'],
        xdescribe: ['xcontext'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
