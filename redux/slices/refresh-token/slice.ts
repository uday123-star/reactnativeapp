import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RefreshTokenResponse } from '../../../data/queries/user-data/renew-token';
import { CurrentUserState } from '../current-user/slice';

const initialState: Partial<CurrentUserState> = {
  accessToken: '',
  accessTokenExp: '',
};

export const refreshUserTokenSlice = createSlice({
  name: 'refreshUserToken',
  initialState,
  reducers: {
    refreshUserToken(state, { payload }: PayloadAction<Partial<CurrentUserState>>): Partial<CurrentUserState> {
      return {
        ...state,
        ...payload,
        isRefreshing: false,
        error: null,
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('refreshUserToken/refresh/pending'),
        (state: Partial<CurrentUserState>) => {
          state.isRefreshing = true;
          state.error = null;
        }
      )
      .addCase(
        createAction<RefreshTokenResponse>('refreshUserToken/refresh/fulfilled'),
        (state: Partial<CurrentUserState>, { payload }) => {
          const {
            accessToken,
            accessTokenExp,
          } = payload.refresh;
          state.accessToken = accessToken;
          state.accessTokenExp = accessTokenExp;
          state.isRefreshing = false;
          state.error = null;
        }
      )
      .addCase(
        createAction('refreshUserToken/refresh/rejected'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state: Partial<CurrentUserState>, action: any) => {
          state.isRefreshing = false;
          state.error = action.error.message;
        }
      )
  }
});

export const { refreshUserToken } = refreshUserTokenSlice.actions;

export default refreshUserTokenSlice.reducer;
