/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  3: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;
    const newState: RootState = {
      ...state,
      appConfig: {
        ...state.appConfig,
        features: {
          ...state.appConfig.features,
          isConversationsEnabled: false
        }
      },
    };
    return newState as PersistedState;
  }
};

export default migration;
