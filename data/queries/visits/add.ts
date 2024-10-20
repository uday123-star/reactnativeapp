import { gql } from '@apollo/client';
import { VisitOrigin, VisitsResponse } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface AddVisitArgs {
  visiteeId: string
  visitOrigin: VisitOrigin
}

export interface AddVisitResponse {
  visitByVisiteeId: VisitsResponse
}


// before you go getting all judgy... add_visit is a query intentionally.
// apollo cache can not subscribe to a mutation result. There is a REST API
// defect that prevents return type while querying an anonymous visit.
// the only option is to use a query, as a findOneOrCreate type method.
// this allows the update and delete mutations to trigger a UI reflow. If
// it was a mutation, the relevant useEffect hooks would not see state changes
// mess with this at your own peril. 🪦💀🤮

export const ADD_VISIT = gql`
query ${QUERY_PREFIX}_getVisit ($visiteeId: ID!, $visitOrigin: String) {
  visitByVisiteeId(
    visiteeId:$visiteeId,
    visitOrigin:$visitOrigin
  ) {
    id
    visitType
    visitDate
    visitOrigin
    visiteeId
    visitorId
  }
}
`;

export const GET_VISIT = ADD_VISIT
