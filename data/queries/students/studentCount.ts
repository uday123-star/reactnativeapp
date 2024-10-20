import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export const STUDENT_COUNT = gql`
  query ${QUERY_PREFIX}getStudentCount($affiliationId: ID!) {
      affiliation(affiliationId: $affiliationId) {
        studentInfo
      }
    }
`;
