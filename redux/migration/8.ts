/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  8: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;

    if ('myLocationSection' in state) {
      delete state['myLocationSection']
    }

    const newState: RootState = {
      ...state
    }

    return newState as PersistedState
  }
};

export default migration;
