import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TEST_USER_EMAIL } from '../../../src/adapters/configuration';

const initialState = {
  email: TEST_USER_EMAIL || '',
  password: '',
  visitorId: '',
  hasError: false,
}

export const signInSlice = createSlice({
  name: 'signInScreen',
  initialState,
  reducers: {
    setEmail: (state, { payload: email }: PayloadAction<string>) => {
      return {
        ...state,
        email
      }
    },
    setPassword: (state, { payload: password }: PayloadAction<string>) => {
      return {
        ...state,
        password
      }
    },
    setVisitorId: (state, { payload: visitorId }: PayloadAction<string>) => {
      return {
        ...state,
        visitorId
      }
    },
    clearPassword: (state) => {
      return {
        ...state,
        password: initialState.password
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('currentUser/authenticate/pending'),
        (state) => {
          state.hasError = false,
          state.password = '';
        }
      )
      .addCase(
        createAction('currentUser/authenticate/rejected'),
        (state) => {
          state.hasError = true;
        }
      )
  }
})

export const { setEmail, setPassword, setVisitorId, clearPassword } = signInSlice.actions;

export default signInSlice.reducer;

