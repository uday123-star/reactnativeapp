import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { BasicAlertInput } from './basicAlert';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function onBasicAlert() {
  const initialState: Partial<BasicAlertInput> = {
    title: '',
    text: '',
    isVisible: false,
    buttonText: undefined,
    titleAccessibilityLabel: undefined,
    textAccessibilityLabel: undefined,
    buttonAccessibilityLabel: undefined,
    acceptText: undefined,
    onAccept: () => setAlertData({
      ...(initialState as BasicAlertInput),
      isVisible: false,
    }),
    onClose: () => setAlertData({
      ...(initialState as BasicAlertInput),
      isVisible: false,
    }),
  };
  const [ alertData, setAlertData ] = useState<BasicAlertInput>({
    ...(initialState as BasicAlertInput),
    isVisible: false,
  });
  useEffect(() => {
    DeviceEventEmitter.addListener('event.onBasicAlert', (data: BasicAlertInput) => {
      setAlertData({
        ...data,
        isVisible: true,
        onClose: () => {
          if (data.onClose) {
            data.onClose();
          }
          setAlertData({
            ...(initialState as BasicAlertInput),
            isVisible: false,
          })
        },
        onAccept: () => {
          if (data.onAccept) {
            data.onAccept();
          }
          setAlertData({
            ...(initialState as BasicAlertInput),
            isVisible: false,
          })
        }
      });
    });
    return () => {
      DeviceEventEmitter.removeAllListeners('event.onBasicAlert')
    }
  }, []);

  useEffect(() => {
    DeviceEventEmitter.addListener('event.onBasicAlertClear', () => {
      setAlertData({
        ...alertData,
        ...initialState
      });
    });
    return () => {
      DeviceEventEmitter.removeAllListeners('event.onBasicAlertClear')
    }
  }, []);

  return alertData;
}

type ShowAlert = Omit<BasicAlertInput, 'isVisible'>;

function show(state: ShowAlert) {
  hide();
  DeviceEventEmitter.emit('event.onBasicAlert', state);
}

function hide() {
  DeviceEventEmitter.emit('event.onBasicAlertClear');
}

export const BasicAlertHook = {
  show,
  hide,
  reset: () => DeviceEventEmitter.emit('event.onBasicAlertClear')
}
