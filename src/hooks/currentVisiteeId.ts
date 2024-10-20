import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { setVisiteeIdByOrigin } from '../../redux/slices/visits/slice';
import { useAppThunkDispatch } from '../../redux/store';
import { VisitOrigin } from '../../types/interfaces';

interface inputType {
  visiteeId: string
  origin: VisitOrigin
}

export function useCurrentVisiteeIdByOrigin(origin: VisitOrigin) {
  const dispatch = useAppThunkDispatch();
  const focused = useIsFocused();
  const visiteeIdByOrigin = useAppSelector(state => focused ? state.visits[origin] : undefined);
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('event.currentVisiteeIdByOrigin', (data: inputType) => {
      dispatch(setVisiteeIdByOrigin(data));
    });
    return () => {
      subscription.remove();
    }
  }, []);

  return visiteeIdByOrigin;
}

export function useSetCurrentVisiteeIdByOrigin(origin: VisitOrigin) {
  const dispatch = useAppThunkDispatch();
  return (visiteeId: string) => {
    dispatch(setVisiteeIdByOrigin({
      visiteeId,
      origin
    }));
  };
}
