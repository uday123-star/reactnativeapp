/**
 * this warning hack is for disabling unwanted warnings that are not related to our own code
 * some warnings has been emerged due to changes/updates on some dependencies
 * this avoid to display the yellow box message on the devclient and also removes
 * the terminal warning.
 */
import { LogBox } from 'react-native';

if (__DEV__) {
  const ignoreWarns: (string | RegExp)[] = [
    'Task orphaned', // This warnign is generated when an <image> tag is loading and removed before finishing the load.
    'EventEmitter.removeListener(\'change\', ...)', // Related to recent update that replaces listeners with subscriptios, this code is included on some dependencies.
    'Sending `onReanimatedPropsChange`', // This error is related to expo-dev-launcher, expo-dev-menu and react-native-reanimated, it may disapear on coming updates.
    /Cancelled by user/g, // Warning returned when query is cancelled by the cancelLink interceptor.
  ];

  const isAllowedWarning = (string: string, warning: string | RegExp): boolean => {
    if (typeof warning === 'string') {
      if (string?.startsWith && string?.startsWith(warning)) {
        return false;
      }
    }
    if (warning instanceof RegExp) {
      if (warning.test(string)) {
        return false;
      }
    }
    return true;
  }
  const warn = console.warn;
  console.warn = (...arg) => {
    const errorString = arg.join(', ')
    for (const warning of ignoreWarns) {
      if (!isAllowedWarning(arg[0], warning) || !isAllowedWarning(errorString, warning)) {
        return;
      }
    }
    warn(...arg);
  };

  const error = console.error;
  console.error = (...arg) => {
    const errorString = arg.join(', ')
    for (const warning of ignoreWarns) {
      if (!isAllowedWarning(arg[0], warning) || !isAllowedWarning(errorString, warning)) {
        return;
      }
    }
    error(...arg);
  };

  LogBox.ignoreLogs(ignoreWarns);
}
