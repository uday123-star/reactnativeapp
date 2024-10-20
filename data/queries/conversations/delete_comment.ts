import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { COMMENT_FIELDS } from './common';
import { Comment } from './types';

export interface DelCommentResponse {
  deleteComment: Comment
}

export const DELETE_COMMENT = gql`
mutation ${QUERY_PREFIX}deleteComment($id: ID!){
  deleteComment(id:$id) {
    ${COMMENT_FIELDS}
  }
}
`;
