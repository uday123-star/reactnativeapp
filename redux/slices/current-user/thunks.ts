import { createAsyncThunk } from '@reduxjs/toolkit';
import { LOGIN, LoginResponse } from '../../../data/queries/user-data/login';
import Client from '../../../src/adapters/apollo-client.adapter';
interface Variables {
  email: string
  password: string
  userAgent: string
  visitorId: string
  deviceId: string
}

export const authenticate = createAsyncThunk('currentUser/authenticate', async ({ email, password, userAgent, visitorId, deviceId }: Variables, { rejectWithValue }) => {
  try {
    const canMakeApiCall = email.length && password.length;

    if (canMakeApiCall) {
      const { data, errors } = await Client.mutate<LoginResponse>({ mutation: LOGIN, variables: { email, password, userAgent, visitorId, deviceId }});
      if (errors) {
        return rejectWithValue(errors);
      }
      return data as LoginResponse;
    }
  } catch (e) {
    return rejectWithValue(e);
  }
  return rejectWithValue('invalid username or password');
});
