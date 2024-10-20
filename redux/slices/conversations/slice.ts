import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hasSeenWelcomeScreen: false
}

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    hasSeenWelcomeScreen(state) {
      return {
        ...state,
        hasSeenWelcomeScreen: true
      }
    }
  }
});

export default conversationsSlice.reducer;

export const { hasSeenWelcomeScreen } = conversationsSlice.actions;
