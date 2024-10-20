import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export const GET_VISITS_DATA = gql`
query ${QUERY_PREFIX}getVisits($personId: ID){
  people(id: $personId){
    visits{
      namedCount
      totalCount
      newCount
    }
  }
}
`;
