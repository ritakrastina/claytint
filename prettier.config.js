/** @type {import('prettier').Config} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react$',
    '^react-dom(/.*)?$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[./]',
  ],
}
