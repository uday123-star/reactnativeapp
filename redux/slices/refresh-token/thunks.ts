import { createAsyncThunk } from '@reduxjs/toolkit';
import { REFRESH_TOKEN } from '../../../data/queries/user-data/renew-token';
import store from '../../store';
import { refreshClient } from './helpers';
import { FetchResult } from '@apollo/client';
import { getDeviceId } from '../../../src/helpers/device';
import { buildAuthHeader } from '../current-user/helpers';

let MUTATION: Promise<FetchResult> | null = null;

export const refreshAccessToken = createAsyncThunk('refreshUserToken/refresh', async (_,{ rejectWithValue }) => {
  try {
    const deviceId = await getDeviceId();
    const {
      refreshToken = '',
    } = store.getState().currentUser;
    const authHeader = buildAuthHeader(refreshToken);
    if (MUTATION === null) {
      MUTATION = refreshClient.mutate({
        mutation: REFRESH_TOKEN,
        variables: { deviceId },
        context: {
          headers: authHeader
        },
      });
    }
    const { data, errors } = await MUTATION;
    if (errors) {
      rejectWithValue(errors);
    }
    MUTATION = null;
    return data;
  } catch (e) {
    return rejectWithValue(e);
  }
});
