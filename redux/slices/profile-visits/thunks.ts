import { createAsyncThunk } from '@reduxjs/toolkit';
import apolloClient from '../../../src/adapters/apollo-client.adapter';
import { PROFILE_VISITS, ProfileVisitsResponse } from '../../../data/queries/profile-visits/fetch';

interface ProfileVisitsArgs {
  limit: number
  offset?: number
}

export const profileVisitsThunk = createAsyncThunk(
  'profileVisits/fetch',
  async ({ limit, offset = 0 }: ProfileVisitsArgs) => {
    const response = await apolloClient.query<Promise<ProfileVisitsResponse>>({
      query: PROFILE_VISITS,
      variables: {
        limit,
        offset,
      }
    })

    return response.data;
  }
);

export const loadMoreProfileVisitsThunk = createAsyncThunk(
  'profileVisits/loadMore',
  async ({ limit, offset = 0 }: ProfileVisitsArgs) => {
    const response = await apolloClient.query<Promise<ProfileVisitsResponse>>({
      query: PROFILE_VISITS,
      variables: {
        limit,
        offset,
      }
    })

    return response.data;
  }
);

export const refreshProfileVisitsThunk = createAsyncThunk(
  'profileVisits/refresh',
  async ({ limit, offset = 0 }: ProfileVisitsArgs) => {
    const response = await apolloClient.query<Promise<ProfileVisitsResponse>>({
      query: PROFILE_VISITS,
      variables: {
        limit,
        offset,
      },
      fetchPolicy: 'cache-first',
    })

    return response.data;
  }
);
