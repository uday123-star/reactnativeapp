import { gql } from '@apollo/client';
import { VisitTypeEnum, VisitsResponse } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface UpdateVisitArgs {
  visitId: string
  visitType: VisitTypeEnum
  visiteeId: string
}

export interface UpdatedVisitsResponse {
  updateVisit: VisitsResponse
}

export const UPDATE_VISIT = gql`
mutation ${QUERY_PREFIX}updateVisit($visitId: ID!, $visitType: String!, $visiteeId: ID!) {
  updateVisit(visitId: $visitId, visitType: $visitType, visiteeId: $visiteeId) {
    id
    visitDate
    visitOrigin
    visitType
    visitorId
    visiteeId
    canUpdate
    shouldLogEvent
  }
}
`;
