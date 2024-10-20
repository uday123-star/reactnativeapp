import React from 'react'
import { EndUserLicenseAgreement, AppUpdateScreen, SignInScreen } from '../../screens'
import { useAppSelector, useHasAcceptedEULA, useHasSeenTrackingScreen } from '../../redux/hooks'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Colors } from '../../styles/colors'
import { TrackingScreen } from '../../screens/TrackingScreen'
import { isIOS } from '../helpers/device'
import { NavigationContainer } from '@react-navigation/native'
import { DdRumReactNavigationTracking } from '@datadog/mobile-react-navigation'
import { Drawer } from './drawer';
import { BlockedUserStack, Stack } from './stacks/index';
import { useConfiguration } from '../hooks'

enum SwitchNavigationState {
  EULA_ROUTE,
  SIGN_IN_SCREEN,
  IS_SIGNED_IN,
  IOS_TRACKING_SCREEN,
  NEEDS_UPGRADE_SCREEN
}

export const SwitchNavigation = (): JSX.Element => {
  const { EULA_ROUTE, SIGN_IN_SCREEN, IS_SIGNED_IN, IOS_TRACKING_SCREEN, NEEDS_UPGRADE_SCREEN } = SwitchNavigationState;
  const isSignedIn = useAppSelector(state => state.currentUser.isSignedIn);
  const hasAcceptedEULA = useHasAcceptedEULA();
  const needsTrackingScreen = isIOS() && !useHasSeenTrackingScreen();
  const needsUpgradeScreen = false;
  const navigationRef = React.useRef(null);
  const { dataDogConfig } = useConfiguration();

  const _switchNavigationState = () => {
    switch (true) {
      case needsUpgradeScreen:
        return NEEDS_UPGRADE_SCREEN;
      case needsTrackingScreen:
        return IOS_TRACKING_SCREEN;
      case !hasAcceptedEULA:
        return EULA_ROUTE;
      case isSignedIn:
        return IS_SIGNED_IN;
      default:
        return SIGN_IN_SCREEN;
    }
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: Colors.whiteRGBA(), flex: 1 }}>
      <NavigationContainer ref={navigationRef}
        onReady={() => {
          if (navigationRef && dataDogConfig.enabled && dataDogConfig.screenView) {
            DdRumReactNavigationTracking.startTrackingViews(navigationRef.current)
          }
      }}
      >
        {(_switchNavigationState() === NEEDS_UPGRADE_SCREEN) && (
          <Stack.Navigator initialRouteName="AppUpdate" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={AppUpdateScreen} name="AppUpdate" />
          </Stack.Navigator>
        )}

        {(_switchNavigationState() === IOS_TRACKING_SCREEN) && (
          <Stack.Navigator initialRouteName="iosTrackingPermission" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={TrackingScreen} name="iosTrackingPermission" />
          </Stack.Navigator>
        )}

        {(_switchNavigationState() === EULA_ROUTE) && (
          <Stack.Navigator initialRouteName='EULA' screenOptions={{ headerShown: false }}>
            <Stack.Screen component={EndUserLicenseAgreement} name="EULA" />
          </Stack.Navigator>
        )}

        {(_switchNavigationState() === SIGN_IN_SCREEN) && (
          <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={SignInScreen} name="SignIn" />
          </Stack.Navigator>
        )}

        {(_switchNavigationState() === IS_SIGNED_IN) && (
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={Drawer} name="Root" />
            <Stack.Screen component={BlockedUserStack} name="BlockedUsers" />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
