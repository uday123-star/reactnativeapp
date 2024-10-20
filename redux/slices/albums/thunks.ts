import { createAsyncThunk } from '@reduxjs/toolkit';
import { UpdateAlbumArgs, AddAlbumArgs, UpdateAlbumsResponse, UPDATE_ALBUM, ADD_ALBUM } from '../../../data/queries/photos/albums';
import apolloClient from '../../../src/adapters/apollo-client.adapter';

export const updateAlbumThunk = createAsyncThunk(
  'album/update',
  async ({ entityId, name, description, coverPhoto }: UpdateAlbumArgs, { rejectWithValue }) => {
    try {
      const response = await apolloClient.mutate<Promise<UpdateAlbumsResponse>>({
        mutation: UPDATE_ALBUM,
        variables: {
          entityId,
          name,
          description,
          coverPhoto
        }
      })

      return response.data;
    } catch (e) {
      console.log('Updating Album threw an error : ', e);
      console.log('Album', entityId, name, description, coverPhoto);
      return rejectWithValue(e);
    }
  }
)

export const addAlbumThunk = createAsyncThunk(
  'album/add',
  async ({ type, title, description, entityId }: AddAlbumArgs): Promise<UpdateAlbumsResponse|null|undefined> => {
    try {
      const response = await apolloClient.mutate<Promise<UpdateAlbumsResponse>>({
        mutation: ADD_ALBUM,
        variables: {
          type,
          title,
          description,
          entityId
        }
      })

      return response.data;
    } catch (e) {
      console.log('Adding Album threw an error : ', e);
      console.log('Album', type, title, description, entityId);
    }
  }
)
