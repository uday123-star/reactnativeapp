import { gql } from '@apollo/client';
import { CurrentUser } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface LoginResponse {
  login: {
    accessToken: string
    accessTokenExp: string
    refreshToken: string
    refreshTokenExp: string
    visitorId: string
    me: CurrentUser
  }
}

export const LOGIN = gql`
  mutation ${QUERY_PREFIX}Login($email: String!, $password: String!, $userAgent: String!, $visitorId: String!, $deviceId: String!) {
    login(email: $email, password: $password, userAgent: $userAgent, visitorId: $visitorId, deviceId: $deviceId) {
      accessToken
      accessTokenExp
      refreshToken
      refreshTokenExp
      visitorId
      me {
        id
        personId
        firstName
        lastName
        creationDate
        stories {
          id
          owner
          text
          visibleState
        }
        settings {
          privacy {
            featureBioInEmails
          }
        }
        membershipState
        source
        birthDate
        birthDateConfidenceLevel
        currentCity
        currentState
        primaryAffiliation {
          id
          schoolId
          schoolName
          schoolState
          schoolCity
          gradYear
          endYear
        }
        thenPhoto {
          id
          display {
            url
          }
        }
        nowPhoto {
          id
          display {
            url
          }
        }
      }
    }
  }`;
