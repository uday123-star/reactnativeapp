import { gql } from '@apollo/client';
import { Photo } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { AlbumPrivacyLevels, AlbumType } from './albums';
import { getPhotosCommonFields } from './common';

export interface GetPhotosAlbumsResponse {
  photos: {
    info: number
    photos: Photo[]
  }
}

export enum PhotosVisibleState {
  VISIBLE = 'VISIBLE',
  RUDE = 'RUDE',
  INAPPROPRIATE = 'INAPPROPRIATE',
  MC_APPROVED = 'MC_APPROVED',
  MC_HIDDEN = 'MC_HIDDEN',
  DELETED = 'DELETED',
  IN_PROCESS = 'IN_PROCESS',
  MC_DELETED = 'MC_DELETED',
  OWNER_DELETED = 'OWNER_DELETED',
}

export enum PrivacyLevels {
  PUBLIC = 'PUBLIC',
  COMMUNITY_AND_FRIENDS = 'COMMUNITY_AND_FRIENDS',
  FRIENDS = 'FRIENDS',
}

export interface CommonPhotosFilter {
  albumTypes?: AlbumType[]
  visibleStates?: PhotosVisibleState[]
}

export interface PhotosFilter extends CommonPhotosFilter {
  ids?: string[]
  createdBy?: string[]
  albumPrivacyLevels?: AlbumPrivacyLevels[]
}

export interface GetAlbumPhotosArgs {
  albumId?: string
  personId?: string
  schoolId?: string
  year?: string
  forcedIds?: [string]
  limit?: number
  offset?: number
  filters?: PhotosFilter
}

export const GET_ALBUM_PHOTOS = gql`
query ${QUERY_PREFIX}getPhotos($albumId: ID){
  photos(
    albumId: $albumId,
    orderBy: {
      creation_date: DESC
    }
  ) {
    info
    photos {
      ${getPhotosCommonFields(false)}
    }
  }
}
`;

export const GET_PHOTOS_MULTIPURPOSE = gql`
  query getPhotos(
    $personId: ID,
    $albumId: ID,
    $schoolId: ID,
    $classId: ID,
    $year: String,
    $filters: PhotosFilter,
    $forcedIds: [ID!],
    $limit: Int,
    $offset: Int
  ) {
    photos (
      userId: $personId,
      albumId: $albumId,
      schoolId: $schoolId,
      year: $year,
      classId: $classId,
      filters: $filters,
      limit: $limit,
      offset: $offset,
      forcedIds: $forcedIds
    ) {
      info
      photos {
        ${getPhotosCommonFields(true)}
      }
    }
  }
`;
