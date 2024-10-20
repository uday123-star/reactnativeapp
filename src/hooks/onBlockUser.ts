import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

type state = {
  action: 'block' | 'unblock'
  personId: string
}

export function useOnBlockUser() {
  const [ blockedState, setBlockedState ] = useState<state>();
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('event.onBlockUser', (data: state) => {
      setBlockedState(data);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  return blockedState;
}

export function setBlockState(data: state) {
  DeviceEventEmitter.emit('event.onBlockUser', data);
}
