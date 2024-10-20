import { gql } from '@apollo/client';
import { Photo, VisitsReceivedInfo } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface VisitsReceivedArgs {
  limit: number
  offset: number
}
export interface VisitReceived {
  id: string
  visitDate: string
  visitOrigin: string
  visitorFirstName: string
  visitorLastName: string
  visitorId: string
  personId: string
  nowPhoto: Partial<Photo>
  thenPhoto: Partial<Photo>
  visitorAffiliation: {
    schoolName: string
  }
}

export interface ProfileVisitsResponse {
  visitsReceived: {
    info: VisitsReceivedInfo
    records: VisitReceived[]
  }
}

export const PROFILE_VISITS = gql`
query ${QUERY_PREFIX}getVisitsReceived($limit:Int!,$offset:Int!) {
  visitsReceived(limit:$limit, offset:$offset) {
    info {
      namedCount
      newCount
      totalCount
    }
    records {
      id
      visitDate
      visitOrigin
      visitorFirstName
      visitorLastName
      visitorId
      personId
      nowPhoto {
        display {
          url
        }
      }
      thenPhoto {
        display {
          url
        }
      }
      visitorAffiliation {
        schoolName
      }
    }
  }
}`;
