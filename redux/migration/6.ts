/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  6: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;
    const newState: RootState = {
      ...state,
      appConfig: {
        ...state.appConfig,
        conversations: {
          pollInterval: 30000
        }
      }
    };
    return newState as PersistedState
  }
};

export default migration;
