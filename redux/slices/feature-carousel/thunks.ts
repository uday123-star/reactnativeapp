/**
 * TODO: This file should be deleted and replace Thunk calls from ProfileVisits.tsx by using apollo hooks
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { FeatureCarouselArgs, FeatureCarouselResponse, LOAD_CAROUSEL } from '../../../data/queries/people/feature-carousel';
import apolloClient from '../../../src/adapters/apollo-client.adapter';

export const featureCarouselThunk = createAsyncThunk<
  FeatureCarouselResponse | void,
  FeatureCarouselArgs
>(
  'featureCarousel/load',
  async ({ schoolId = '', year = '' }, { rejectWithValue }) => {
    try {
      const response = await apolloClient.query<Promise<FeatureCarouselResponse>>({
        query: LOAD_CAROUSEL,
        variables: {
          schoolId,
          year,
        }
      })

      return response.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
)

