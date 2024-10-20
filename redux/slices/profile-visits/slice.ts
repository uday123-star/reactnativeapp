/**
 * TODO: Profile Visits Slices/Thunks should be migrated by using apollo hooks and delete the files.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createEntityAdapter, createAction } from '@reduxjs/toolkit';
import { ProfileVisitsResponse, VisitReceived } from '../../../data/queries/profile-visits/fetch';

export const profileVisitsAdapter = createEntityAdapter<VisitReceived>();

export enum ProfileVisitState {
  isLoading,
  isReloading,
  isLoadingMore,
  hasNoResults,
  hasResults,
  hasError,
}

export const enum ProfileVisitModalState {
  isVisible,
  isHidden,
}

const initialState = profileVisitsAdapter.getInitialState({
  profileVisitState: ProfileVisitState.isLoading,
  profileVisitModalState: ProfileVisitModalState.isHidden,
  pageSize: 100,
  totalCount: 0,
  namedCount: 0,
  newCount: 0
});

export const profileVisitsSelectors = profileVisitsAdapter.getSelectors();

export const ProfileVisitsSlice = createSlice({
  initialState,
  name: 'profile-visits',
  reducers: {
    closeModal(state) {
      return {
        ...state,
        profileVisitModalState: ProfileVisitModalState.isHidden
      }
    },
    openModal(state) {
      return {
        ...state,
        profileVisitModalState: ProfileVisitModalState.isVisible
      }
    },
    flushAllVisits(state) {
      profileVisitsAdapter.removeAll(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('profileVisits/fetch/pending'),
        (state) => {
          const isReloading = state.profileVisitState === ProfileVisitState.isReloading;
    
          // if we did a pull to reload,
          // it's ok to leave the state as reloading
          // to trigger proper spinner display
          if (!isReloading) {
            state.profileVisitState = ProfileVisitState.isLoading;
          }
        }
      )
      .addCase(
        createAction<ProfileVisitsResponse>('profileVisits/fetch/fulfilled'),
        (state, { payload }) => {

          const { info, records: visitsReceived = []} = payload.visitsReceived;
    
          if (!visitsReceived.length) {
            state.profileVisitState = ProfileVisitState.hasNoResults;
            profileVisitsAdapter.removeAll(state);
          }
    
          if (visitsReceived.length) {
            state.profileVisitState = ProfileVisitState.hasResults;
            state.totalCount = info.totalCount;
            state.namedCount = info.namedCount;
            state.newCount = info.newCount;
            profileVisitsAdapter.setAll(state, visitsReceived);
          }
        }
      )
      .addCase(
        createAction('profileVisits/fetch/rejected'),
        (state, action: any) => {
          state.profileVisitState = ProfileVisitState.hasError;
          console.error('Kaboom :: ', action.error);
        }
      )
      // Hack, because Apollo nextFetchPolicy is
      //  not working at this time
      .addCase(
        createAction('profileVisits/refresh/pending'),
        (state) => {
          state.profileVisitState = ProfileVisitState.isReloading;
        }
      )
      .addCase(
        createAction<ProfileVisitsResponse>('profileVisits/refresh/fulfilled'),
        (state, { payload }) => {

          const { info, records: visitsReceived = []} = payload.visitsReceived;
    
          if (!visitsReceived.length) {
            state.profileVisitState = ProfileVisitState.hasNoResults;
            profileVisitsAdapter.removeAll(state);
          }
    
          if (visitsReceived.length) {
            state.profileVisitState = ProfileVisitState.hasResults;
            state.totalCount = info.totalCount;
            state.namedCount = info.namedCount;
            state.newCount = info.newCount;
            profileVisitsAdapter.setAll(state, visitsReceived);
          }
        }
      )
      .addCase(
        createAction('profileVisits/refresh/rejected'),
        (state, action: any) => {
          state.profileVisitState = ProfileVisitState.hasError;
          console.error('Kaboom :: ', action.error);
        }
      )
      .addCase(
        createAction('profileVisits/loadMore/pending'),
        (state) => {
          state.profileVisitState = ProfileVisitState.isLoadingMore;
        }
      )
      .addCase(
        createAction<ProfileVisitsResponse>('profileVisits/loadMore/fulfilled'),
        (state, { payload }) => {

          const { records: visitsReceived = []} = payload.visitsReceived;
    
          if (visitsReceived.length) {
            profileVisitsAdapter.addMany(state, visitsReceived);
            state.profileVisitState = ProfileVisitState.hasResults;
          }
        }
      )
      .addCase(
        createAction('profileVisits/loadMore/rejected'),
        (state, action: any) => {
          state.profileVisitState = ProfileVisitState.hasError;
          console.error('Kaboom :: ', action.error);
        }
      )
  }
});

export const { closeModal, openModal, flushAllVisits } = ProfileVisitsSlice.actions;

export default ProfileVisitsSlice.reducer;
