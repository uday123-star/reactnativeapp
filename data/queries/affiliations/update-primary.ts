import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export interface UpdatePrimaryAffiliationArgs {
  affiliationId: string
}

export interface UpdatePrimaryAffiliationResponse {
  updatePrimary: {
    id: string
  }
}

export const UPDATE_PRIMARY_AFFILIATION = gql`
mutation ${QUERY_PREFIX}updatePrimaryAffiliation($affiliationId: ID!) {
  updatePrimaryAffiliation(affiliationId:$affiliationId) {
    creationDate
    endYear
    firstName
    gradYear
    id
    lastName
    personId
    role
    schoolId
    schoolName
    startYear
    studentInfo
  }
}
`
