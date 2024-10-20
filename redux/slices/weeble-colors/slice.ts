import { createSlice } from '@reduxjs/toolkit';

interface Payload {
  [id: string]: string
}
const initialState: Payload = {};

const WeebleColors = createSlice({
  name: 'WeebleColors',
  initialState,
  reducers: {
    setWeebleColor(state, { payload }: {
      payload: {
        id: string
        color: string
      }
    }) {
      return {
        ...state,
        [payload.id]: payload.color
      }
    },
  },
});

export const { setWeebleColor } = WeebleColors.actions;

export default WeebleColors.reducer;
