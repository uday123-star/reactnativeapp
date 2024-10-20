/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  5: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;
    const newState: RootState = {
      ...state,
      appConfig: {
        ...state.appConfig,
        dataDogConfig: {
          enabled: false,
          nativeCrashReport: false,
          jsCrashReport: false,
          shouldReportNonFatalErrors: false,
          screenView: false,
          sessionSamplingRate: 0,
          resourceTracingSamplingRate: 0,
          shouldLogActions: false,
        }
      }
    };
    return newState as PersistedState
  }
};

export default migration;
