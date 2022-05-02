module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-import', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
  ],
  rules: {
    complexity: ['error', 5],
    'sonarjs/cognitive-complexity': ['error', 5],
    'max-lines': ['error', 110],
    'max-lines-per-function': ['error', 90],
    'max-statements': ['error', 13],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    'max-depth': ['error', 2],
    'import/no-cycle': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};
