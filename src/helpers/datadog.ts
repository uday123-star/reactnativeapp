import { DdRum } from '@datadog/mobile-react-native'
import store from '../../redux/store';

type InputStart = Parameters<typeof DdRum.addAction>
type InputStop = Parameters<typeof DdRum.stopAction>

export const dataDogStartAction = (...input: InputStart) => {
  const { dataDogConfig } = store.getState().appConfig;
  if (dataDogConfig.enabled && dataDogConfig.shouldLogActions) {
    DdRum.addAction(...input);
  }
}

export const dataDogStopAction = (...input: InputStop) => {
  const { dataDogConfig } = store.getState().appConfig;
  if (dataDogConfig.enabled && dataDogConfig.shouldLogActions) {
    DdRum.stopAction(...input);
  }
}
