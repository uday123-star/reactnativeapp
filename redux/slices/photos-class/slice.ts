/**
 * TODO: All Photo Slices/Thunks should be migrated by using apollo hooks and delete the files.
 */
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { GetPhotoResponse } from '../../../data/queries/photos/get-featured-photos';
import { Photo } from '../../../types/interfaces';

export const classPhotoAdapter = createEntityAdapter<Photo>()
export const classPhotoSelector = classPhotoAdapter.getSelectors()

export enum PhotoState {
  isLoading,
  isEmpty,
  hasResults,
  hasError
}

const initialState = classPhotoAdapter.getInitialState({
  classPhotoState: PhotoState.isLoading,
  info: 0
});

export const ClassPhotoSlice = createSlice({
    name: 'classPhotosSlice',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          createAction('classPhotos/load/pending'),
          (state) => {
            state.classPhotoState = PhotoState.isLoading;
          }
        )
        .addCase(
          createAction<GetPhotoResponse>('classPhotos/load/fulfilled'),
          (state, { payload }) => {
    
            if (payload && (!payload.photos.info || payload.photos.photos.length === 0)) {
              state.classPhotoState = PhotoState.isEmpty;
            } else {
              classPhotoAdapter.setAll(state, payload?.photos?.photos);
              state.classPhotoState = PhotoState.hasResults;
              state.info = payload?.photos?.info;
            }
          }
        )
        .addCase(
          createAction('classPhotos/load/rejected'),
          (state, { payload }) => {
            console.error('There was an error while loading class photos :: ', payload);
            state.classPhotoState = PhotoState.hasError;
          }
        )
    }
})

export default ClassPhotoSlice.reducer;
