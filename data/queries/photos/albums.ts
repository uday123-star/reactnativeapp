import { gql } from '@apollo/client';
import { AlbumModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { CommonPhotosFilter, PhotosVisibleState, PrivacyLevels } from './photos';

export interface GetAlbumsResponse {
  albums: {
    info: number
    albums: AlbumModel[]
  }
}

export interface UpdateAlbumsResponse {
  updateAlbum: AlbumModel
}

export interface AddAlbumsResponse {
  addAlbum: AlbumModel
}

export interface UpdateAlbumArgs {
  entityId: string
  name?: string
  description?: string
  coverPhoto?: string
}

export interface AddAlbumArgs {
  type: string
  title: string
  description?: string
  entityId?: string
}

export enum AlbumType {
  ALL = 'ALL',
  PERSONAL_ALBUM = 'PERSONAL_ALBUM',
  PROFILE_DEFAULT = 'PROFILE_DEFAULT',
  CLASS_DEFAULT = 'CLASS_DEFAULT',
  SCHOOL_LOGO = 'SCHOOL_LOGO',
  COMMUNITY_ALBUM = 'COMMUNITY_ALBUM',
  FACEBOOK_PHOTOS = 'FACEBOOK_PHOTOS',
  NOW_PHOTOS = 'NOW_PHOTOS',
  THEN_PHOTOS = 'THEN_PHOTOS',
  CLIPPED_PHOTO_ALBUM = 'CLIPPED_PHOTO_ALBUM',
}

export enum AlbumPrivacyLevels {
  PUBLIC = 'PUBLIC',
  COMMUNITY_AND_FRIENDS = 'COMMUNITY_AND_FRIENDS',
  FRIENDS = 'FRIENDS',
}
export interface AlbumsFilter extends CommonPhotosFilter {
  photoOwners?: string[]
  photoVisibleStates?: PhotosVisibleState[]
  privacyLevels?: PrivacyLevels[]
}

export interface GetAlbumsVariables {
  currentUser?: boolean
  filters?: AlbumsFilter
  personId?: string
  schoolId?: string
  classId?: string
  eventId?: string
}

export const GET_ALBUMS = gql`
query ${QUERY_PREFIX}getAlbums($currentUser: Boolean,$filters: AlbumsFilter, $personId: ID, $schoolId: ID, $classId:ID, $eventId: ID){
  albums(
    currentUser: $currentUser,
    userId: $personId,
    schoolId: $schoolId,
    classId: $classId,
    eventId: $eventId,
    filters: $filters
  ) {
    info
    albums {
      id
      type
      name
      description
      createdBy
      ownerId
      ownerType
      creationDate
      lastModifiedDate
      coverPhoto {
        thumbnail{
          url
        }
      }
    }
  }
}
`;

export const UPDATE_ALBUM = gql`
mutation ${QUERY_PREFIX}updateAlbum($entityId: ID!, $name: String, $description: String, $coverPhoto: ID) {
  updateAlbum(
    entityId: $entityId,
    name: $name,
    description: $description,
    coverPhoto: $coverPhoto
  ){
    id
    name
    description
    type
    ownerId
    ownerType
    coverPhoto {
      thumbnail {
        url
      }
    }
    createdBy
    creationDate
    lastModifiedDate
  }
}
`;

export const ADD_ALBUM = gql`
mutation ${QUERY_PREFIX}addAlbum($type: AddAlbumType!, $title: String!, $description: String, $entityId: ID){
  addAlbum(
    type: $type,
    name: $title,
    description: $description,
    entityId: $entityId
  ){
    id
    name
    description
    type
    ownerId
    ownerType
    coverPhoto {
      thumbnail {
        url
      }
    }
    createdBy
    creationDate
    lastModifiedDate
  }
}
`;
