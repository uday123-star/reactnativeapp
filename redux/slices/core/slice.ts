import { createSlice } from '@reduxjs/toolkit'
import { spoofUserAgent } from '../../../src/helpers/device'

const initialState = {
  userAgent: spoofUserAgent(),
  hasAcceptedEULA: false,
  hasSeenTrackingScreen: false
}

export const coreSlice = createSlice({
  name: 'core',
  initialState,
  reducers: {
    acceptEULA(state) {
      return {
        ...state,
        hasAcceptedEULA: true
      }
    },
    hasSeenTrackingScreen(state) {
      return {
        ...state,
        hasSeenTrackingScreen: true
      }
    }
  }
});

export default coreSlice.reducer;

export const { acceptEULA, hasSeenTrackingScreen } = coreSlice.actions;
