/* eslint-disable  @typescript-eslint/no-explicit-any */
import { MigrationManifest, PersistedState } from 'redux-persist';
import { RootState } from '../store';

const migration: MigrationManifest = {
  9: (persistedState: PersistedState): PersistedState => {
    const state = persistedState as RootState;

    if ('bioOptOut' in state) {
      delete state['bioOptOut']
    }

    if ('classListHeader' in state) {
      delete state['classListHeader']
    }

    if ('birthDateSection' in state) {
      delete state['birthDateSection']
    }

    if ('myAffiliationSection' in state) {
      delete state['myAffiliationSection']
    }

    if ('myStorySection' in state) {
      delete state['myStorySection']
    }

    const newState: RootState = {
      ...state
    }

    return newState as PersistedState
  }
};

export default migration;
