import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { AuthorInput } from './types';

export interface Follow {
  id: string
  conversation_id: string
  creation_date: string
  last_update_date: string
  followed_by: AuthorInput
}

export interface AddFollowResponse {
  addFollow: Follow
}

export interface AddFollowInput {
  followInput: {
    conversation_id: string
  }
  authorAffiliationId: string
}

export const ADD_FOLLOW = gql`
mutation ${QUERY_PREFIX}addFollow($followInput: AddFollowInputNoAuthor!, $authorAffiliationId: ID!) {
  addFollow(
    followInput: $followInput,
    authorAffiliationId: $authorAffiliationId
  ) {
    id
    conversation_id
    creation_date
    last_update_date
    followed_by {
      registration_id
      name
      photo
    }
  }
}
`;

export interface DeleteFollowResponse {
  deleteFollow: Follow
}

export interface DeleteFollowInput {
  id: string
}

export const DELETE_FOLLOW = gql`
mutation ${QUERY_PREFIX}deleteFollow($id: ID!) {
  deleteFollow(
    id: $id
  ) {
    id
    conversation_id
    creation_date
    last_update_date
    followed_by {
      registration_id
      name
      photo
    }
  }
}
`;
