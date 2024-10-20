/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  4: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;
    const newState: RootState = {
      ...state,
      currentScreen: {
        name: '',
        params: {}
      },
    };
    return newState as PersistedState
  }
};

export default migration;
