import dotenv from 'dotenv'
import { ExpoConfig } from '@expo/config'
import { version as packageVersion } from './package.json'
dotenv.config({
  path: `${__dirname}/.env`
})

const [ version, buildNumber = '0' ] = packageVersion.split('-');

// Load ENV
dotenv.config();

type AppEnvironments = 'PRODUCTION'|'DEVELOPMENT'|'STAGING';

export interface Extra {
  API_URL: string
  TEST_USER_EMAIL: string
  APP_ENV?: AppEnvironments
  EAS_CI_BUILD?: string
}

// Grab values from ENV.
// by setting defaults here, they
// are easier to debug in expo.io
const {
  EAS_CI_BUILD,
  API_URL = '',
  TEST_USER_EMAIL = '',
  /**
   * ! APP_ENV must not have a default value
   * ! when APP_ENV is undefined, the build process must fail
   * ! if it had a default value, it could log GA events in the wrong environments.
   * ! logs should only be sent when APP_ENV==='PRODUCTION'
   * ! If we specified a default value for APP_ENV... GA could send bad logs across the seven hells. Triggering the apocalypse.
   */
  APP_ENV,
}: Extra = (process.env as unknown) as Extra;

const extra: Extra = {
  API_URL,
  TEST_USER_EMAIL,
  APP_ENV,
}

if (EAS_CI_BUILD) {
  console.log(extra);
  console.log('<==========BUILDING FROM GITLAB-CI==========>')
}

const errorText = `Kaboom :: missing required ENV vars:
\t\u2022 API_URL and APP_ENV are required.
\t\u2022 Current ENV: ${JSON.stringify(extra)}`
// Die if required ENV is missing
if (!EAS_CI_BUILD && (!API_URL || !APP_ENV)) {
  throw new Error(errorText);
}
if (EAS_CI_BUILD && (!API_URL || !APP_ENV)) {
  console.error(errorText);
}

export default (): ExpoConfig => {
  return {
    owner: 'classmates',
    name: 'Classmates',
    slug: 'classmates-mobile-app',
    version,
    orientation: 'portrait',
    icon: './assets/app-icons/ios.png',
    scheme: 'cmates',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/adaptive-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#009bd3'
    },
    plugins: [
      'expo-community-flipper',
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission: 'Allow this app to collect app-related data to help us organize special offers and make improvements.'
        }
      ], [
        'expo-image-picker',
        {
          photosPermission: 'Allow access to photos so that you can upload and share photos from your library with your schoolmates.',
          cameraPermission: 'Allow access to the camera so that you can take photos and upload them to share with your schoolmates.',
        }
      ],
      [
        './plugins/mods.plugin.js',
      ]
    ],
    extra: {
      ...extra,
      eas: {
        'projectId': '4fe72063-ce53-4d01-9c0c-c7e5221684bb'
      }
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.peopleconnect.classmates',
      buildNumber,
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        FirebaseAutomaticScreenReportingEnabled: false,
        ITSAppUsesNonExemptEncryption: false,
      }
    },
    android: {
      package: 'com.peopleconnect.classmates',
      versionCode: +buildNumber,
      adaptiveIcon: {
        foregroundImage: './assets/app-icons/android.png',
        backgroundColor: '#009bd3'
      },
      googleServicesFile: './google-services.json',
    },
    packagerOpts: {
      config: 'metro.config.js',
      sourceExts: [
        'expo.ts',
        'expo.tsx',
        'expo.js',
        'expo.jsx',
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'wasm',
        'svg'
      ]
    }
  }
}
