import { createSlice } from '@reduxjs/toolkit';

interface Payload {
  name: string
  params: {
    [key: string]: unknown
  }
}

const initialState: Payload = {
  name: '',
  params: {}
};

const CurrentScreenSlice = createSlice({
  name: 'Screens',
  initialState,
  reducers: {
    setCurrentScreenData(state, { payload }: {
      payload: Payload
    }) {
      state = payload;
      return state;
    },
  },
});

export const { setCurrentScreenData } = CurrentScreenSlice.actions;

export default CurrentScreenSlice.reducer;
