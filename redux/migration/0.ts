/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {  
  0: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState
    const newState: RootState = {
      ...state,
      myProfile: {
        ...state.myProfile,
        currentUser: {
          ...state.myProfile.currentUser,
          source: 0
        }
      },
    }
    return newState as PersistedState;
  }
};

export default migration;
