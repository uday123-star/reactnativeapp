import { DdSdkReactNative, DdSdkReactNativeConfiguration } from '@datadog/mobile-react-native';
import { APP_ENV } from './configuration';

const initDDConfig = (options: Partial<DdSdkReactNativeConfiguration>) => {

  let config = new DdSdkReactNativeConfiguration(
    'pubf29c863e11bc897bd3d4ab90c1604334',
    APP_ENV || 'development',
    '52cbc66d-c4de-49f9-bd6f-744580418988',
    true, // track User interactions (e.g.: Tap on buttons. You can use 'accessibilityLabel' element property to give tap action the name, otherwise element type will be reported)
    true, // track XHR Resources
    true // track Errors
  )

  config.site = 'US'
  config.firstPartyHosts = ['classmates.com', 'ppcn.us']

  config.firstPartyHosts = ['classmates.com', 'ppcn.us']

  config = {
    ...config,
    ...options
  }

  return DdSdkReactNative.initialize(config);
}

export { initDDConfig }
