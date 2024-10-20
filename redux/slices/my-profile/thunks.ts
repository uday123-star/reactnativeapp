import { createAsyncThunk } from '@reduxjs/toolkit';
import { Affiliations, FETCH_ALL_AFFILIATIONS } from '../../../data/queries/affiliations/fetch-all-affiliations';
import { BASIC_PROFILE, FetchMyProfileArgs, FetchMyProfileResponse, MEDIUM_PROFILE } from '../../../data/queries/my-profile/fetch';
import apolloClient from '../../../src/adapters/apollo-client.adapter';

export const fetchAllAffiliationThunk = createAsyncThunk(
  'my-profile/fetch-all-affiliations',
  async () => {
    try {
      const response = await apolloClient.query<Affiliations>({
        query: FETCH_ALL_AFFILIATIONS,
        fetchPolicy: 'no-cache',
      });

      return response.data
    } catch (e) {
      console.log('fetching all affiliations throws error : ', e);
    }
  }
)

export const refetchAllAffiliationThunk = createAsyncThunk(
  'my-profile/refetch-all-affiliations',
  async () => {
    try {
      const response = await apolloClient.query<Affiliations>({
        query: FETCH_ALL_AFFILIATIONS,
        fetchPolicy: 'no-cache',
      });

      return response.data
    } catch (e) {
      console.log('fetching all affiliations throws error : ', e);
    }
  }
)

export const refetchPartialProfileThunk = createAsyncThunk(
  'my-profile/partial',
  async ({ id = '', type = 'BASIC' }: FetchMyProfileArgs) => {

    try {
      const response = await apolloClient.query<FetchMyProfileResponse>({
        query: type === 'BASIC' ? BASIC_PROFILE : MEDIUM_PROFILE,
        variables: {
          id
        },
        fetchPolicy: 'no-cache',
      })
      return response.data;
    } catch (e) {
      console.log('loading partial profile threw an error : ', e);
    }
  }
);
