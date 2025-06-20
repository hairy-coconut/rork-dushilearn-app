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
    bundleIdentifier: 'com.dushilearn.app',
    buildNumber: '1',
    infoPlist: {
      NSUserTrackingUsageDescription: 'This app uses tracking to provide personalized learning experiences.',
      NSCameraUsageDescription: 'This app uses the camera to scan QR codes for friend connections.',
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to set profile pictures.',
      NSMicrophoneUsageDescription: 'This app uses the microphone for pronunciation exercises.',
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.dushilearn.app',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'RECORD_AUDIO',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
      'WAKE_LOCK'
    ]
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/icon.png'
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
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification-sound.wav']
      }
    ]
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: '41f9c4fc-65fc-40e3-a5e1-5591baf96e1e'
    }
  }
}; 