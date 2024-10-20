/* eslint-disable @typescript-eslint/no-var-requires */
const { withAndroidManifest, withAndroidStyles, AndroidConfig, withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const generateCode = require('@expo/config-plugins/build/utils/generateCode');

module.exports = function withNoAutomaticScreenReporting(config) {
  const manifestConfig = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    try {

      if (!manifest['supports-screens']) manifest['supports-screens'] = []
      const supportsScreens = manifest['supports-screens'];
      supportsScreens.push({
        '$': {
          'android:smallScreens':'false',
          'android:normalScreens':'true',
          'android:largeScreens':'true',
          'android:xlargeScreens':'false',
          'android:requiresSmallestWidthDp':320,
        }
      });
    } catch (error) {
      console.error(error)
    }

    try {
      const app = manifest.application[0];
      if (!app['meta-data']) app['meta-data'] = [];
      const metadata = app['meta-data'];
      metadata.push({
        '$': {
          'android:name': 'google_analytics_automatic_screen_reporting_enabled',
          'android:value': 'false'
        }
      });
    } catch (error) {
      console.error(error)
    }
    return config;
  });

  const stylesConfig = withAndroidStyles(manifestConfig, (config) => {
    if (config.modResults.resources.style.findIndex(style => style.$.name === 'Theme.ClassMatesSplash') === -1) {
      config.modResults.resources.style.push(AndroidConfig.Resources.buildResourceGroup({
        name: 'Theme.ClassMatesSplash',
        parent: 'AppTheme',
        items: [
          AndroidConfig.Resources.buildResourceItem({ name: 'android:windowBackground', value: '@drawable/splashscreen' }),
        ]
      }));
    }
    config.modResults.resources.style.map(style => {
      if (style.$.name === 'Theme.App.SplashScreen') {
        style.item = [
          AndroidConfig.Resources.buildResourceItem({ name: 'windowSplashScreenBackground', value: '@android:color/transparent' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'android:windowSplashScreenBackground', value: '@android:color/transparent' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'windowSplashScreenAnimatedIcon', value: '@android:color/transparent' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'android:windowSplashScreenAnimatedIcon', value: '@android:color/transparent' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'windowSplashScreenAnimationDuration', value: '100' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'android:windowSplashScreenAnimationDuration', value: '100' }),
          AndroidConfig.Resources.buildResourceItem({ name: 'postSplashScreenTheme', value: '@style/Theme.ClassMatesSplash' }),
        ]
      }
      return style;
    });
    return config;
  });

  const gradleConfig = withAppBuildGradle(stylesConfig, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      'dependencies {',
      'dependencies {\n' +
      '\timplementation "androidx.core:core-splashscreen:1.0.0"'
    )
    return config;
  });

  const podConfig = withDangerousMod(gradleConfig, [
    'ios',
    async (config) => {
      const code = `  pod 'Firebase', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  $RNFirebaseAsStaticFramework = true`;
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      const contents = fs.readFileSync(filePath, 'utf-8');

      const addCode = generateCode.mergeContents({
        tag: 'withReactNativeFirebase',
        src: contents,
        newSrc: code,
        anchor: /\s*get_default_flags\(\)/i,
        offset: 2,
        comment: '#',
      });

      if (!addCode.didMerge) {
        console.error(
          'ERROR: Cannot add withReactNativeFirebase to the project\'s ios/Podfile because it\'s malformed.'
        );
        return config;
      }

      fs.writeFileSync(filePath, addCode.contents);

      return config;
    },
  ]);
  return podConfig;
};
