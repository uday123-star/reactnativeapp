import { createAction, createSlice } from '@reduxjs/toolkit';
import { UpdateAlbumsResponse, AddAlbumsResponse } from '../../../data/queries/photos/albums';
import { AlbumModel } from '../../../types/interfaces';

export enum AlbumsState {
  isLoading,
  updated,
  saved,
  hasError
}

export interface AlbumResponse extends AlbumModel {
  albumState: AlbumsState | null
}

const initialState: Partial<AlbumResponse> = {
  albumState: null
};

export const AlbumsSlice = createSlice({
    name: 'albumsSlice',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          createAction('album/update/pending'),
          (state) => {
            state.albumState = AlbumsState.isLoading;
          }
        )
        .addCase(
          createAction<UpdateAlbumsResponse>('album/update/fulfilled'),
          (state, { payload }) => {
            state = {
              ...payload.updateAlbum,
              albumState: AlbumsState.updated
            };
          }
        )
        .addCase(
          createAction('album/update/rejected'),
          (state, { payload }) => {
            console.log('Something bad happened :: ', payload);
            state.albumState = AlbumsState.hasError;
          }
        )
        .addCase(
          createAction('album/add/pending'),
          (state) => {
            state.albumState = AlbumsState.isLoading;
          }
        )
        .addCase(
          createAction<AddAlbumsResponse>('album/add/fulfilled'),
          (state, { payload }) => {
            state = {
              ...payload.addAlbum,
              albumState: AlbumsState.saved
            };
          }
        )
        .addCase(
          createAction('album/add/rejected'),
          (state, { payload }) => {
            console.log('Something bad happened :: ', payload);
            state.albumState = AlbumsState.hasError;
          }
        )
    }
})

export default AlbumsSlice.reducer;
