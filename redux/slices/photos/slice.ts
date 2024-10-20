/**
 * TODO: All Photo Slices/Thunks should be migrated by using apollo hooks and delete the files.
 */
import { createAction, createSlice } from '@reduxjs/toolkit';
import { GetPhotosAlbumsResponse } from '../../../data/queries/photos/photos';

export enum PhotosState {
  isLoading,
  hasResults,
  hasError
}

export interface AlbumPhotosResponse extends GetPhotosAlbumsResponse {
  photosState: PhotosState | null
}

const initialState: AlbumPhotosResponse = {
  photos: {
    info: 0,
    photos: []
  },
  photosState: null
};

export const AlbumPhotosSlice = createSlice({
    name: 'albumPhotosSlice',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          createAction('albumPhotos/get/pending'),
          (state) => {
            state.photosState = PhotosState.isLoading;
          }
        )
        .addCase(
          createAction<GetPhotosAlbumsResponse>('albumPhotos/get/fulfilled'),
          (state, { payload }) => {
            state = {
              ...payload,
              photosState: PhotosState.hasResults
            };
          }
        )
        .addCase(
          createAction('albumPhotos/get/rejected'),
          (state, { payload }) => {
            console.log('Something bad happened :: ', payload);
            state.photosState = PhotosState.hasError;
          }
        )
    }
})

export default AlbumPhotosSlice.reducer;
