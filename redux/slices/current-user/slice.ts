import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LoginResponse } from '../../../data/queries/user-data/login'

export interface CurrentUserState {
  accessToken: string
  accessTokenExp: string
  refreshToken: string
  refreshTokenExp: string
  visitorId: string
  membership: string
  isSignedIn: boolean
  isLoading: boolean
  isRefreshing: boolean
  refreshTokenExpired: boolean
  error: Error | null
}

const initialState: CurrentUserState = {
  accessToken: '',
  accessTokenExp: '',
  refreshToken: '',
  refreshTokenExp: '',
  visitorId: '',
  membership: '',
  isSignedIn: false,
  isLoading: false,
  isRefreshing: false,
  refreshTokenExpired: false,
  error: null,
};

export const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    signOut(state, { payload }: PayloadAction<Partial<CurrentUserState>>): CurrentUserState {
      return {
        ...state,
        accessToken: '',
        accessTokenExp: '',
        refreshToken: '',
        refreshTokenExp: '',
        isSignedIn: false,
        isLoading: false,
        ...payload,
      }
    },
    setCurrentUserState(state, { payload }: PayloadAction<Partial<CurrentUserState>>): CurrentUserState {
      return {
        ...state,
        ...payload,
        isLoading: false,
        isSignedIn: true,
        error: null,
      }
    },
    setIsSignedIn(state): CurrentUserState {
      return {
        ...state,
        isSignedIn: true,
        isLoading: false,
        error: null,
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('currentUser/authenticate/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addCase(
        createAction<LoginResponse>('currentUser/authenticate/fulfilled'),
        (state: CurrentUserState, { payload }) => {
          const {
            accessToken,
            accessTokenExp,
            refreshToken,
            refreshTokenExp,
            visitorId,
            me
          } = payload.login;
          state.accessToken = accessToken;
          state.accessTokenExp = accessTokenExp;
          state.refreshToken = refreshToken;
          state.refreshTokenExp = refreshTokenExp;
          state.visitorId = visitorId;
          state.membership = me.membershipState;
        }
      )
      .addCase(
        createAction('currentUser/authenticate/rejected'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.error.message;
        }
      )
  }
});

export const { signOut, setCurrentUserState, setIsSignedIn } = currentUserSlice.actions;

export default currentUserSlice.reducer;
