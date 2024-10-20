import { gql } from '@apollo/client';
import { CurrentUser } from '../../../types/interfaces';
import { AFFILIATION_FIELDS } from '../affiliations/common';
import { QUERY_PREFIX } from '../constants';
import { BASIC_PERSON_FIELDS } from '../people/common';
import { getPhotosCommonFields } from '../photos/common';

export interface FetchMyProfileArgs {
  id: string
  type?: 'BASIC'|'MEDIUM'
}

export interface FetchMyProfileResponse {
  people: [CurrentUser]
}

export const FETCH_MY_PROFILE = gql`
query ${QUERY_PREFIX}fetchPersonData($id: ID!) {
  people(id:$id) {
    ${BASIC_PERSON_FIELDS}
    creationDate
    source
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
    currentCity
    currentState
    primaryAffiliation {
      ${AFFILIATION_FIELDS}
    }
    visits {
      newCount
      namedCount
      totalCount
    }
    photos(limit: 20) {
      ${getPhotosCommonFields(false)}
    }
    affiliations {
      ${AFFILIATION_FIELDS}
    }
  }
}
`;

export const BASIC_PROFILE = gql`
query ${QUERY_PREFIX}fetchPersonData($id: ID!) {
  people(id:$id) {
    id
    personId
    firstName
    lastName
    creationDate
    source
    membershipState
    birthDate
    birthDateConfidenceLevel
    currentCity
    currentState
  }
}
`;

export const MEDIUM_PROFILE = gql`
query ${QUERY_PREFIX}fetchPersonData($id: ID!) {
  people(id:$id) {
    id
    personId
    firstName
    lastName
    source
    settings {
      privacy {
        featureBioInEmails
      }
    }
    membershipState
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
`;

