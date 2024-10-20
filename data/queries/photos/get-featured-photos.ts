import { gql } from '@apollo/client';
import { Photo } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { getPhotosCommonFields } from './common';
import { PhotosFilter } from './photos';

// TODO: make sure these are all the Args that we need
export interface GetPhotoArgs {
  classId?: string
  schoolId?: string
  year?: string
  filters?: PhotosFilter
  forcedIds?: string[]
}

export interface GetPhotoResponse {
  photos: {
    info: number
    photos: Photo[]
  }
}

// TODO: figure out what data we neeed and add them to query.  Also why are the types set to ID.  Shouldn't they be strings?
export const GET_PHOTOS = gql`
query ${QUERY_PREFIX}getPhotos($schoolId: ID!, $year: String!, $classId: ID!, $filters: PhotosFilter!, $forcedIds: [ID!]) {
  photos (schoolId: $schoolId, year: $year, classId: $classId, filters: $filters, limit: 20, shuffle: true, forcedIds: $forcedIds) {
    info
    photos {
      ${getPhotosCommonFields(true)}
    }
  }
}
`;
