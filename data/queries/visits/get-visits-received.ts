import { gql } from '@apollo/client';

export interface GetVisitsReceivedResponse {
  id: string
  visitDate: string
}

export const GET_VISITS_RECEIVED = gql`
{
  visitsReceived {
    id
    visitDate
  }
}
`;

