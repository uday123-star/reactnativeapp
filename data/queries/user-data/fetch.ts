import { gql } from '@apollo/client';
import { UserModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface FetchUserArgs {
  regId: string
}

export interface FetchUserResponse {
  people: [UserModel]
}

export const FETCH_USER_DATA = gql`
query ${QUERY_PREFIX}fetchPersonData($id: ID!) {
  people(id:$id) {
    id
    personId
    firstName
    lastName
    isBlocked
    primaryAffiliation {
      id
      schoolId
      schoolName
      schoolState
      schoolCity
      gradYear
      endYear
      role
    }
    nowPhoto {
      id
      display {
        height
        width
        url
      }
    }
    thenPhoto {
      id
      display {
        height
        width
        url
      }
    }
    visits {
      newCount
      namedCount
      totalCount
    }
  }
}
`;

export const USER_BASIC_DATA = gql`
query ${QUERY_PREFIX}fetchPersonBasicData($id: ID!) {
  people(id:$id) {
    id
    personId
    firstName
    lastName
    primaryAffiliation {
      id
      schoolId
      schoolName
      schoolState
      schoolCity
      gradYear
      endYear
      role
    }
    nowPhoto {
      id
      display {
        height
        width
        url
      }
    }
    thenPhoto {
      id
      display {
        height
        width
        url
      }
    }
    visits {
      newCount
      namedCount
      totalCount
    }
  }
}
`;

