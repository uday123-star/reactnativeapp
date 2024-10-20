import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetAlbumPhotosArgs, GetPhotosAlbumsResponse, GET_ALBUM_PHOTOS } from '../../../data/queries/photos/photos';
import apolloClient from '../../../src/adapters/apollo-client.adapter';

export const getAlbumPhotosThunk = createAsyncThunk(
  'albumPhotos/get',
  async ({ albumId }: GetAlbumPhotosArgs, { rejectWithValue }) => {
    try {
      const response = await apolloClient.query<Promise<GetPhotosAlbumsResponse>>({
        query: GET_ALBUM_PHOTOS,
        variables: {
          albumId
        }
      })

      return response.data;
    } catch (e) {
      console.log('Getting Photos threw an error : ', e);
      console.log('Album', albumId);
      return rejectWithValue(e);
    }
  }
)
