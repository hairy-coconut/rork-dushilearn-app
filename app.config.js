export default {
  name: 'DushiLearn',
  slug: 'dushilearn',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'dushilearn',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dushilearn.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.dushilearn.app'
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
    output: 'static',
    build: {
      babel: {
        include: ['@expo/vector-icons']
      }
    }
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static'
        }
      }
    ]
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  }
}; 