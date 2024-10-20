import { gql } from '@apollo/client'
import { CurrentUser } from '../../../types/interfaces'
import { QUERY_PREFIX } from '../constants'
import { getPhotosCommonFields } from '../photos/common'

export interface UpdateLocationArgs {
  currentCity: string
  currentState: string
}

export interface UpdateLocationResponse {
  updatePerson: CurrentUser
}

export const UPDATE_USER_LOCATION = gql`
mutation ${QUERY_PREFIX}updateLocation($currentCity: String!, $currentState:String!) {
  updatePerson(currentUser:true,currentCity:$currentCity,currentState:$currentState) {
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
    membershipState
    birthDate
    birthDateConfidenceLevel
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
    visits {
      newCount
      namedCount
      totalCount
    }
    photos(limit: 20) {
      ${getPhotosCommonFields(false)}
    }
  }
}
`;
