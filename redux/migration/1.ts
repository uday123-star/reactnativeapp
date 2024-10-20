/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {  
  1: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState
    const newState: RootState = {
      ...state,
      myProfile: {
        ...state.myProfile,
        currentUser: {
          ...state.myProfile.currentUser,
          primaryAffiliation: {
            ...state.myProfile.currentUser.primaryAffiliation,
            id: ''
          }
        }
      },
    };
    return newState as PersistedState;
  }
};

export default migration;
