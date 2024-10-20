import { gql } from '@apollo/client';
import { StudentModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { getPhotosCommonFields } from '../photos/common';

export interface FeatureCarouselArgs {
  schoolId: string
  year: string
}

export interface FeatureCarouselResponse {
  carousel: {
    id: string
    itemCount: number
    items: StudentModel[]
  }
}

export const LOAD_CAROUSEL = gql`
query ${QUERY_PREFIX}featureCarousel($schoolId: ID!, $year: String!) {
  carousel(schoolId: $schoolId, year: $year, excludeCurrentUser: true) {
    id
    items {
      id
      firstName
      lastName
      personId
      schoolId
      gradYear
      hasBirthdateAvailable
      school{
        schoolName
      }
      nowPhoto {
        id
        display{
          url
          width
          height
        }
      }
      thenPhoto {
        id
        display {
          url
          width
          height
        }
      }
      photos(limit: 20) {
        ${getPhotosCommonFields(false)}
      }
      visits {
        namedCount
        totalCount
        newCount
      }
      isBlocked @client
    }
    itemCount
  }
}
`;

