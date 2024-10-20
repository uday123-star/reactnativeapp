import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { COMMENT_FIELDS } from './common';
import { Comment } from './types';

export interface UpdateCommentResponse {
  updateComment: Comment
}

export const UPDATE_COMMENT = gql`
  mutation ${QUERY_PREFIX}updateComment($id: ID!, $message: [MessageBlockInput!]!) {
    updateComment(id: $id, message: $message) {
      ${COMMENT_FIELDS}
    }
  }
`;
