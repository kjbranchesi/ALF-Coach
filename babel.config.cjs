// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['babel-plugin-transform-vite-meta-env', {
      env: {
        MODE: 'test',
        DEV: false,
        PROD: false,
        TEST: true,
      },
    }],
  ],
};
