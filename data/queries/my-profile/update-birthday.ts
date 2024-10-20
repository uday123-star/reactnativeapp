import { gql } from '@apollo/client'
import { CurrentUser } from '../../../types/interfaces'
import { QUERY_PREFIX } from '../constants';
import { BASIC_PERSON_FIELDS } from '../people/common';
import { getPhotosCommonFields } from '../photos/common';

export interface UpdateBirthdayArgs {
  birthDate: string
}

export interface UpdateBirthdayResponse {
  updatePerson: CurrentUser
}

export const UPDATE_MY_BIRTHDAY = gql`
mutation ${QUERY_PREFIX}updateBirthday($birthDate: String!) {
  updatePerson(currentUser:true,birthDate:$birthDate) {
    ${BASIC_PERSON_FIELDS}
    creationDate
    stories {
      id
      owner
      text
      visibleState
    }
    membershipState
    currentCity
    currentState
    settings {
      privacy {
        featureBioInEmails
      }
    }
    primaryAffiliation {
      id
      schoolId
      schoolName
      schoolState
      schoolCity
      gradYear
      endYear
    }
    photos(limit: 20) {
      ${getPhotosCommonFields(false)}
    }
    visits {
      newCount
      namedCount
      totalCount
    }
  }
}
`;

