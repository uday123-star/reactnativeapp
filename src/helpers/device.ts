import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

/**
 * Reads the device id based on the Operating system, for having a unique identifier
 * for the installed app.
 * @returns Android/iOS device ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    return (
      Application.androidId ||
      await Application.getIosIdForVendorAsync() ||
      'unknown'
    );
  } catch (error) {
    return 'unknown';
  }
}

export function isIpad(): boolean {
  return Device.osName === 'iPadOS';
}

export function isAndroid(): boolean {
  return !!Constants.platform?.android;
}

export function isIOS(): boolean {
  return !!Constants.platform?.ios;
}

export function spoofUserAgent(): string {
  const { osName, osVersion, manufacturer, modelName } = Device;
  const identifier = isIOS() ? 'IOS' : 'Android';
  return `mobile-${identifier}-${manufacturer}-${modelName}-${osName}-${osVersion}`;
}
