import 'expo-dev-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { AppLoadingScreen } from './screens';
import { useFonts, Raleway_100Thin } from '@expo-google-fonts/raleway';
// import { registerForPushNotificationsAsync } from './src/push-notifications';
import store, { persistor } from './redux/store'
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import client from './src/adapters/apollo-client.adapter';
import { APP_ENV } from './src/adapters/configuration';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import './ignoreWarnings';
// eslint-disable-next-line import/named
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import BasicAlert from './src/components/BasicAlert';
import { SwitchNavigation } from './src/navigation/switch-navigation';
import { Provider } from 'react-native-paper';
import { AppProvider } from './src/components/providers/providers';

const getSessionData = () => {
  const currentUser = store.getState().currentUser;
  const userData = {
    id: '',
    membershipState: '',
  };
  const affiliationData = {
    id: '',
  };
  const screenData = {
    name: '',
    params: {},
  }

  if (currentUser.isSignedIn) {
    const user = store.getState().myProfile.currentUser;
    userData.id = user.id;
    userData.membershipState = user.membershipState;
    const currentAffiliation = store.getState().currentAffiliation;
    affiliationData.id = currentAffiliation.currentAffiliation.id;
    const screen = store.getState().currentScreen;
    screenData.name = screen.name;
    screenData.params = screen.params;
  }
  return {
    user: userData,
    current_affiliation: affiliationData.id,
    screen: screenData
  };
}

setJSExceptionHandler((error, isFatal) => {
  const { dataDogConfig } = store.getState().appConfig;
  const isNonProd = APP_ENV?.toUpperCase() !== 'PRODUCTION'
  if (dataDogConfig.enabled && dataDogConfig.jsCrashReport) {
    if (isFatal && !dataDogConfig.shouldReportNonFatalErrors) {
      return;
    }
    const errorMessage = error?.message || 'Javascript error';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorSource = ((error?.cause || {}) as any)?.name || error?.name || 'Uknown source';
    const errorStack = error?.stack || 'Unknow stack';
    DdRum.addError(errorMessage, errorSource, errorStack, {
      error,
      isFatal,
      ...getSessionData()
    }, Date.now());
    isNonProd && alert('Sorry. There was an issue loading data. A report has been sent. Please try again.');
  }
});

setNativeExceptionHandler((exceptionMsg) => {
  const { dataDogConfig } = store.getState().appConfig;
  if (dataDogConfig.enabled && dataDogConfig.nativeCrashReport) {
    DdRum.addError('Native error', ErrorSource.CUSTOM, exceptionMsg, getSessionData(), Date.now());
  }
}, false, true);

// Root component must be a default export
// eslint-disable-next-line react/function-component-definition
export default function App(): JSX.Element {

  const [fontsLoaded] = useFonts({ Raleway_100Thin });

  // useEffect(() => {
  //   // TODO :: Set up company firebase account
  //   // to use push notifications.
  //   // registerForPushNotificationsAsync();
  // }, []);

  if (!fontsLoaded) {
    return <AppLoadingScreen />
  }

  return (
    <ApolloProvider client={client}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Provider>
              {/* <YearbooksStack /> */}
              <AppProvider>
                <SwitchNavigation />
              </AppProvider>
            </Provider>
          </PersistGate>
        </ReduxProvider>
      </GestureHandlerRootView>
      <BasicAlert.Component />
    </ApolloProvider>
  )
}
