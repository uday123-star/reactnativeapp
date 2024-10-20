import Constants from 'expo-constants'
import { Extra } from '../../app.config'

const _extra = Constants.manifest?.extra as Extra

// be sure to set defaults in
// app.config.ts as they will
// be easier to debug in expo
export const API_URL = _extra.API_URL || ''
export const TEST_USER_EMAIL = _extra.TEST_USER_EMAIL || ''
export const APP_ENV = _extra.APP_ENV ? _extra.APP_ENV.toUpperCase() : undefined;

const configuration = {
  apiUrl: API_URL,
}

export default configuration;
