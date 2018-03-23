import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/byu-person-lookup.js',
  output: {
    file: 'dist/byu-person-lookup.js',
    format: 'es',
    name: 'ByuPersonLookup',
  },
  plugins: [
    resolve({}),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**',  // Default: undefined
    })
  ]
};
