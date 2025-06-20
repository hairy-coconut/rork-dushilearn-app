module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
      }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
}; 