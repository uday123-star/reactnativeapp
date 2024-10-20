/**
 * TODO: This file should be deleted and replace Thunk calls from ProfileVisits.tsx by using apollo hooks
 */
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureCarouselResponse } from '../../../data/queries/people/feature-carousel';
import { StudentModel } from '../../../types/interfaces';

export enum CarouselState {
  IsLoading = 1,
  HasOneResult = 2,
  HasManyResults = 3,
  HasNoResults = 4,
  HasError = 5
}

interface InitialState {
  activeIndex: number
  currentSlide: StudentModel | null
  featuredMembers: StudentModel[]
  isLoading: boolean
  carouselState: CarouselState
}

const initialState: InitialState = {
  activeIndex: 0,
  featuredMembers: [],
  currentSlide: null,
  isLoading: true,
  carouselState: CarouselState.IsLoading
}

export const FeatureCarouselSlice = createSlice({
  name: 'FeatureCarousel',
  initialState,
  reducers: {
    setActiveIndex(state, { payload: {
      slideIndex,
      currentSlide
    }}: PayloadAction<{
      slideIndex: number
      currentSlide: StudentModel
    }>) {
      return {
        ...state,
        acitveIndex: slideIndex,
        currentSlide
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('featureCarousel/load/pending'),
        (state) => {
          state.carouselState = CarouselState.IsLoading;
        }
      )
      .addCase(
        createAction<FeatureCarouselResponse>('featureCarousel/load/fulfilled'),
        (state, { payload }) => {

          if (!payload) {
            state.carouselState = CarouselState.HasError;
            console.error('Kaboom : fulfilled with missing payload');
          }
    
          const { items = []} = payload.carousel;
    
          if (!items || !items.length) {
            state.carouselState = CarouselState.HasNoResults;
          }
    
          if (items.length === 1) {
            state.carouselState = CarouselState.HasOneResult;
            state.featuredMembers = items;
          }
    
          if (items.length > 1) {
            state.carouselState = CarouselState.HasManyResults;
            state.featuredMembers = items;
          }
        }
      )
      .addCase(
        createAction('featureCarousel/load/rejected'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state, action: any) => {
          console.log('Kaboom : ', action.error);
          state.carouselState = CarouselState.HasError;
        }
      )
  }
});

export default FeatureCarouselSlice.reducer;

export const { setActiveIndex } = FeatureCarouselSlice.actions;
