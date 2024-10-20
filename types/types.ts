/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { OperationVariables } from '@apollo/client';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Comment, Conversation, Reply, School } from '../data/queries/conversations/types';
import { State } from '../data/queries/location/fetch-states';
import { PhotosFilter } from '../data/queries/photos/photos';
import { ConversationFeedVariables, StudentModel } from './interfaces';

export interface NewContentInfo {
  id: string
  type: 'comment' | 'reply'
  comment_id?: string
}

export interface conversationParams {
  id: string
  shouldFocusComments?: boolean
  focusedCommentId?: string
  conversation?: Conversation
  newContent?: NewContentInfo
}

export type RootStackParamList = {
  SignIn: undefined
  Root: undefined
  Home: undefined
  NotFound: undefined
  MyProfile: NavigatorScreenParams<MyProfileStackParamList>
  Classlist: NavigatorScreenParams<ClasslistStackParamList>
  Photos: NavigatorScreenParams<PhotosStackParamList>
  ProfileVisits: undefined
  BlockedUsers: NavigatorScreenParams<BlockedUsersStackParamList>
  AppUpdate: undefined
  iosTrackingPermission: undefined
  EULA: undefined
  Conversations: NavigatorScreenParams<ConversationsStackParamList>
  _upgrade: undefined
  _pp: undefined
  _tos: {
    section?: string
  }
  _faq: undefined
};

export type ConversationsStackParamList = {
  _welcome: undefined
  _info: undefined
  _feed: undefined
  _tos: {
    section?: string
  }
  _help: {
    ticket_form_id?: string
  }
  _conversation: conversationParams
  BlockedUsers: NavigatorScreenParams<BlockedUsersStackParamList>
  _fullProfile: {
    targetId: string
  }
  _createConversation: {
    feedVariables: ConversationFeedVariables
    update?: Conversation
  }
  _createComment: {
    conversationId: string
    feedVariables?: ConversationFeedVariables
    shouldGoBackWhenComplete?: boolean
    update?: Comment
    parentName: string
    parentSchoolInfo: School
  }
  _createReply: {
    commentId: string
    conversationId: string
    shouldGoBackWhenComplete?: boolean
    update?: Reply
    parentName: string
    parentSchoolInfo: School
  }
  _myProfile: undefined
  _photoCollage: PhotoCollageParams
  _photoCarousel: PhotoCarouselParams
}

export type ClasslistStackParamList = {
  _classlist: undefined
  _carousel: {
    studentId: string
    schoolId: string
    students: StudentModel[]
  }
  _fullProfile: { targetId: string }
  _photoCollage: PhotoCollageParams
  _photoCarousel: PhotoCarouselParams
  _myProfile: undefined
}

/**
 * personId or albumId or schollId (and year) should be set in order to load photos
 * No field is required based on the flexibility offered to the PhotoCollageScreen
 * allowing to use it for different entity's photos
 */
export type PhotoCollageParams = {
  personId?: string
  albumId?: string
  schoolId?: string
  year?: string
  classId?: string
  filters?: PhotosFilter
  forcedIds?: string[]
  limit?: number
  offset?: number
}

type PhotoCarouselParams = {
  // photos: Photo[]
  index?: number
  photoId?: string
  type: 'new-photos' | 'my-profile' | 'multipurpose'
  variables: OperationVariables
}
export type PhotosStackParamList = {
  _photos: undefined
  _photoCollage: PhotoCollageParams
  _photoCarousel: PhotoCarouselParams
  _fullProfile: { targetId: string }
  _myProfile: undefined
}

type EditBirthdayParamList = {
  birthDate: string
}

type EditStateParamList = {
  currentState: string
  currentCity: string
}

type EditCityParamList = {
  currentState: State
  currentCity: string
}

export type MyProfileStackParamList = {
  _myProfileRoot: undefined
  _stateSelection: EditStateParamList
  _citySelection: EditCityParamList
  _editBirthday: EditBirthdayParamList
  _photoCollage: PhotoCollageParams
  _photoCarousel: PhotoCarouselParams
}

export type BlockedUsersStackParamList = {
  _blockedUsersPage: undefined
}

export type BottomTabParamList = {
  TabOne: undefined
  TabTwo: undefined
};

export type TabOneParamList = {
  TabOneScreen: undefined
};

export type TabTwoParamList = {
  TabTwoScreen: undefined
};
