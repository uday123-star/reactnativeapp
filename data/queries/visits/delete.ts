import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export interface DeleteVisitsArgs {
  visitId: string
  visiteeId: string
}

export const DELETE_VISIT = gql`
mutation ${QUERY_PREFIX}DeleteVisit($visitId:ID!, $visiteeId: ID!) {
  deleteVisit(visitId:$visitId, visiteeId: $visiteeId) {
    id
    visitDate
    visitOrigin
    visitType
    visitorId
    visiteeId
    canUpdate
  }
}
`;
