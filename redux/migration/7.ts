/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  7: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;

    if ('fullProfileScreen' in state) {
      delete state['fullProfileScreen']
    }

    const newState: RootState = {
      ...state
    }

    return newState as PersistedState
  }
};

export default migration;
