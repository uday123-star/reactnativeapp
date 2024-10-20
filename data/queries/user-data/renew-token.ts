import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export interface RefreshTokenResponse {
  refresh: {
    accessToken: string
    accessTokenExp: string
  }
}

export const REFRESH_TOKEN = gql`
mutation ${QUERY_PREFIX}Refresh($deviceId: String!){
  refresh(deviceId: $deviceId){
    accessToken
    accessTokenExp
  }
}`;
