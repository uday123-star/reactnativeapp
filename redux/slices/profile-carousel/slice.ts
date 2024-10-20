import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  activeIndex: 0,
  isLoading: false
}

export const ProfileCarouselSlice = createSlice({
  name: 'ProfileCarousel',
  initialState,
  reducers: {
    setActiveIndex(state, { payload: activeIndex }: PayloadAction<number>) {
      return {
        ...state,
        activeIndex
      }
    },
    setIsLoading(state, { payload: isLoading }: PayloadAction<boolean>) {
      return {
        ...state,
        isLoading
      }
    }
  }
});

export default ProfileCarouselSlice.reducer;

export const { setActiveIndex, setIsLoading } = ProfileCarouselSlice.actions;
