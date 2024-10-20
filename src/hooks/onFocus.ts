import { DdRum } from '@datadog/mobile-react-native';
import { RouteProp } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useCurrentAffiliation, useCurrentUser } from '../../redux/hooks';
import { setCurrentScreenData } from '../../redux/slices/screens/slice';
import { useAppThunkDispatch } from '../../redux/store';
import { logEvent } from '../helpers/analytics';
import { useConfiguration } from './useConfiguration';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function useFocusedStatus(navigation: any, route: RouteProp<any>, shouldLogToGA = true) {
  const [ isFocused, setIsFocused ] = useState(false);
  const currentUser = useCurrentUser();
  const currentAffiliation = useCurrentAffiliation();
  const params = route.params ? {
    params: route.params
  } : {};
  const dispatch = useAppThunkDispatch();
  const { dataDogConfig } = useConfiguration();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(setCurrentScreenData({
        name: route.name,
        params: route.params || {}
      }));
      if (shouldLogToGA) {
        logEvent('screen_view', {
          screen_name: route.name,
          current_affiliation: currentAffiliation.id,
          ...params,
        });
      }
      if (dataDogConfig.enabled && dataDogConfig.screenView) {
        DdRum.startView(route.key, route.name, {
          user: {
            id: currentUser.id,
            membershipState: currentUser.membershipState,
          },
          current_affiliation: currentAffiliation.id,
          ...params,
        }, Date.now());
      }
      setTimeout(() => setIsFocused(true), 1000)
    });
    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (dataDogConfig.enabled && dataDogConfig.screenView) {
        DdRum.stopView(route.key, {
          user: {
            id: currentUser.id,
            membershipState: currentUser.membershipState,
          },
          current_affiliation: currentAffiliation.id,
          ...params,
        }, Date.now());
      }
      setIsFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  return isFocused;
}
