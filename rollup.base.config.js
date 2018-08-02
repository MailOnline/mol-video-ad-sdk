/* eslint-disable filenames/match-exported, sort-keys */
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

export const getConfig = (pkg) => {
// eslint-disable-next-line no-process-env
  const production = process.env.NODE_ENV === 'production';

  const plugins = [
    babel({
      exclude: [
        '../../node_modules/**',
        'node_modules/**'
      ],
      plugins: ['external-helpers']
    }),
    resolve({
      customResolveOptions: {
        moduleDirectory: [
          'node_modules',
          '../../node_modules'
        ]
      }
    }),
    commonjs()
  ];

  // NOTE: see https://github.com/rollup/rollup/issues/408 to understand why we silences `THIS_IS_UNDEFINED` warnings
  const onwarn = (warning, warn) => {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning);
  };

  return [
    {
      input: 'src/index.js',
      onwarn,
      output: {
        name: pkg.name,
        file: pkg.browser,
        format: 'umd'
      },
      plugins: [
        ...plugins,
        production && uglify()
      ]
    },
    {
      input: 'src/index.js',
      onwarn,
      output: {
        file: pkg.module,
        format: 'es'
      },
      plugins
    },
    {
      input: 'src/index.js',
      onwarn,
      output: {
        file: pkg.main,
        format: 'cjs'
      },
      plugins
    }
  ];
};
