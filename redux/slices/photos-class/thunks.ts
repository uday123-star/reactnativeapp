import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetPhotoArgs, GetPhotoResponse, GET_PHOTOS } from '../../../data/queries/photos/get-featured-photos';
import apolloClient from '../../../src/adapters/apollo-client.adapter';

// TODO: make schoolID and year dynamic
export const getClassPhotosThunk = createAsyncThunk(
  'classPhotos/load',
  async ({ schoolId = '', year = '', classId = '', filters = {}, forcedIds }: GetPhotoArgs, { rejectWithValue }) => {
    try {
      const response = await apolloClient.query<Promise<GetPhotoResponse>>({
        query: GET_PHOTOS,
        variables: {
          // These are for testing purposes only.  TODO: remove before going to PROD.  Need to add ($id: ID!) to getPhotos call.
          //id: 1000019332, // wide image
          //id: 1000018354, // small image
          //id: 1000017891, // tall image
          schoolId,
          year,
          classId,
          filters,
          forcedIds
        }
      })

      return response.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
)
