import { Platform } from 'react-native';
import { QUERY_PREFIX } from '../../data/queries/constants';
import { buildAuthHeader } from '../../redux/slices/current-user/helpers';
import store from '../../redux/store';
import http from './http-upload';

export enum PhotoType {
  ANNOUNCEMENT_PHOTO = 'ANNOUNCEMENT_PHOTO',
  AVATAR_NOW_PHOTO = 'AVATAR_NOW_PHOTO',
  AVATAR_THEN_PHOTO = 'AVATAR_THEN_PHOTO',
  CLIP_PHOTO = 'CLIP_PHOTO',
  EVENT_PHOTO = 'EVENT_PHOTO',
  MEMBER_STORIES_PHOTO = 'MEMBER_STORIES_PHOTO',
  MEMORY_PHOTO = 'MEMORY_PHOTO',
  NOW_PHOTO = 'NOW_PHOTO',
  PHOTO_ALBUM_TYPE = 'PHOTO_ALBUM_TYPE',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  THEN_PHOTO = 'THEN_PHOTO',
  TIMELINE_PHOTO = 'TIMELINE_PHOTO',
}

export enum CommunityType {
  SCHOOL = 'SCHOOL',
  COLLEGE = 'COLLEGE',
  EDUCATIONALCLASS = 'EDUCATIONALCLASS',
  EVENT = 'EVENT'
}

export enum AlbumType {
  CLASS_DEFAULT = 'CLASS_DEFAULT',
  SCHOOL_LOGO = 'SCHOOL_LOGO',
  PROFILE_DEFAULT = 'PROFILE_DEFAULT',
  PERSONAL_ALBUM = 'PERSONAL_ALBUM',
  COMMUNITY_ALBUM = 'COMMUNITY_ALBUM',
  COMMUNITY_LOGO = 'COMMUNITY_LOGO',
  MEMORY_ALBUM = 'MEMORY_ALBUM',
}

interface UploadFileInput {
  uri: string
  fileName: string
  mimeType: string
  photoType: PhotoType
  classId: string
  onUploadProgress: (progressEvent: ProgressEvent) => void
  albumId?: string
  communityType?: CommunityType
  communityId?: string
}

const QUERY_ALBUM = {
  query: `mutation ${QUERY_PREFIX}photoUpload($file: Upload!, $photoType: PhotoType, $albumId: ID, $classId: ID) {
    uploadPhoto(file: $file, photoType: $photoType, albumId: $albumId, classId: $classId) {
      id,
      albumId,
      display{
        url,
        width,
        height
      }
    }
  }`,
  variables: {
    file: null,
    photoType: '',
    albumId: '',
    classId: '',
  }
};

const QUERY_COMMUNITY = {
  query: `mutation ${QUERY_PREFIX}photoUpload($file: Upload!, $photoType: PhotoType, $communityType: CommunityType, $communityId: ID, $classId: ID) {
    uploadPhoto(file: $file, photoType: $photoType, communityType: $communityType, communityId: $communityId, classId: $classId) {
      id,
      albumId,
      display{
        url,
        width,
        height
      }
    }
  }`,
  variables: {
    file: null,
    photoType: '',
    communityType: '',
    communityId: '',
    classId: '',
  }
};

const QUERY_PHOTOTYPE = {
  query: `mutation ${QUERY_PREFIX}photoUpload($file: Upload!, $photoType: PhotoType, $classId: ID) {
    uploadPhoto(file: $file, photoType: $photoType, classId: $classId) {
      id,
      albumId,
      display{
        url,
        width,
        height
      }
    }
  }`,
  variables: {
    file: null,
    photoType: '',
    classId: '',
  }
};

export const uploadFile = ({
  uri,
  fileName,
  mimeType,
  photoType,
  albumId,
  onUploadProgress,
  communityType,
  communityId,
  classId
}: UploadFileInput) => {
  const formData = new FormData();
  const { accessToken = '' } = store.getState().currentUser;
  const authHeader = buildAuthHeader(accessToken);
  if (albumId) {
    QUERY_ALBUM.variables.photoType = photoType;
    QUERY_ALBUM.variables.albumId = albumId;
    QUERY_ALBUM.variables.classId = classId;
    formData.append('operations', JSON.stringify(QUERY_ALBUM));
  } else if (communityId) {
    QUERY_COMMUNITY.variables.communityId = communityId;
    QUERY_COMMUNITY.variables.communityType = communityType || '';
    QUERY_COMMUNITY.variables.photoType = photoType;
    QUERY_COMMUNITY.variables.classId = classId;
    formData.append('operations', JSON.stringify(QUERY_COMMUNITY));
  } else {
    QUERY_PHOTOTYPE.variables.photoType = photoType;
    QUERY_PHOTOTYPE.variables.classId = classId;
    formData.append('operations', JSON.stringify(QUERY_PHOTOTYPE));
  }
  formData.append('map', '{ "0": ["variables.file"]}');
  formData.append('0', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    name: fileName,
    type: mimeType,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } as any);
  return http.post('/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Apollo-Require-Preflight': 'true',
      ...authHeader
    },
    onUploadProgress,
  });
};
