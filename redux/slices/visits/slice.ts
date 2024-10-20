import { createSlice } from '@reduxjs/toolkit';
import { VisitOrigin } from '../../../types/interfaces';


const initialState: {
  [origin in VisitOrigin]?: string
} = {};

const VisitsSlice = createSlice({
  name: 'CurrentVisiteeIdByOrigin',
  initialState,
  reducers: {
    setVisiteeIdByOrigin(state, { payload: {
      visiteeId,
      origin
    }}: {
      payload: {
        visiteeId: string
        origin: VisitOrigin
      }
    }) {
      state = {
        ...state,
        [origin]: visiteeId
      }
      return state
    }
  },
});

export const { setVisiteeIdByOrigin } = VisitsSlice.actions;

export default VisitsSlice.reducer;
