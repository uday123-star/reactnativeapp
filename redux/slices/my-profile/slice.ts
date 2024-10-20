import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Affiliation, Affiliations } from '../../../data/queries/affiliations/fetch-all-affiliations'
import { LoginResponse } from '../../../data/queries/user-data/login'
import { FetchMyProfileResponse } from '../../../data/queries/my-profile/fetch'
import { CurrentUser } from '../../../types/interfaces'
import { getEmptyCurrentUser } from '../current-user/helpers'

export enum MyProfileState {
  isLoading,
  isRefreshing,
  hasLoaded,
  hasError
}

export enum MyProfileModalState {
  isOpen,
  isClosed
}

export enum AffiliationsState {
  pending,
  hasManyResults,
  hasOneResult,
  hasError
}

interface MyProfileSlice {
  myProfileState: MyProfileState
  myProfileModalState: MyProfileModalState
  currentUser: CurrentUser
  affiliationsState: AffiliationsState
  affiliations: Affiliation[]
  doRefreshOnFocus: boolean
}

const initialState: MyProfileSlice = {
  myProfileState: MyProfileState.isLoading,
  myProfileModalState: MyProfileModalState.isClosed,
  currentUser: getEmptyCurrentUser(),
  affiliationsState: AffiliationsState.pending,
  affiliations: [],
  doRefreshOnFocus: true
}

export const MyProfileSlice = createSlice({
  name: 'myProfile',
  initialState,
  reducers: {
    openModal(state) {
      return {
        ...state,
        myProfileModalState: MyProfileModalState.isOpen
      }
    },
    closeModal(state) {
      return {
        ...state,
        myProfileModalState: MyProfileModalState.isClosed
      }
    },
    upgradeMembership(state) {
      return {
        ...state,
        currentUser: { ...state.currentUser, membershipState: 'GOLD' }
      }
    },
    // We cannot pass params into the myProfile screen
    // with DrawerActions.jumpTo(). This is a workaround
    // until the issue gets fixed.
    // @see https://github.com/react-navigation/react-navigation/issues/8893
    setDoRefreshOnFocus(state, { payload }: PayloadAction<boolean>) {
      return {
        ...state,
        doRefreshOnFocus: payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('my-profile/fetch-all-affiliations/pending'),
        (state) => {
          state.myProfileState = MyProfileState.isLoading;
        }
      )
      .addCase(
        createAction<Affiliations>('my-profile/fetch-all-affiliations/fulfilled'),
        (state, { payload }) => {
          state = processAffiliations(state, payload);
        }
      )
      .addCase(
        createAction('my-profile/fetch-all-affiliations/rejected'),
        (state) => {
          state.affiliationsState = AffiliationsState.hasError;
        }
      )
      // Anything that says refetch is a hack until
      // apollo's nextFetchPolicy works.
      .addCase(
        createAction('my-profile/refetch-all-affiliations/pending'),
        (state) => {
          state.affiliationsState = AffiliationsState.pending;
        }
      )
      .addCase(
        createAction<Affiliations>('my-profile/refetch-all-affiliations/fulfilled'),
        (state, { payload }) => {
          state = processAffiliations(state, payload);
        }
      )
      .addCase(
        createAction('my-profile/refetch-all-affiliations/rejected'),
        (state) => {
          state.affiliationsState = AffiliationsState.hasError;
        }
      )
      // PARTIAL PROFILE
      .addCase(
        createAction('my-profile/partial/pending'),
        (state) => {
          state.myProfileState = MyProfileState.isRefreshing;
        }
      )
      .addCase(
        createAction<FetchMyProfileResponse>('my-profile/partial/fulfilled'),
        (state, { payload }) => {
          const currentUser = payload?.people[0] || {};
          const prevUserData = state.currentUser;
          state.currentUser = {
            ...prevUserData,
            ...currentUser
          };
          state.myProfileState = MyProfileState.hasLoaded;
        }
      )
      .addCase(
        createAction('my-profile/partial/rejected'),
        (state) => {
          state.myProfileState = MyProfileState.hasError;
        }
      )
      .addCase(
        createAction<LoginResponse>('currentUser/authenticate/fulfilled'),
        (state, { payload }) => {
          state.currentUser = payload.login.me;
        }
      )
  }
})

function processAffiliations(state: MyProfileSlice, payload: Affiliations) {
  const { affiliations } = payload || {};

  state.affiliations = affiliations || [];

  if (affiliations.length === 1) {
    state.affiliationsState = AffiliationsState.hasOneResult;
  }

  if (affiliations.length > 1) {
    state.affiliationsState = AffiliationsState.hasManyResults;
  }

  return { ...state };
}

export default MyProfileSlice.reducer;

export const { openModal, closeModal, upgradeMembership, setDoRefreshOnFocus } = MyProfileSlice.actions;
