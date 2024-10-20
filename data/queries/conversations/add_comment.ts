import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { COMMENT_FIELDS } from './common';
import { Comment, Message, School } from './types';

export interface AddCommentInputNoAuthor {
  commentInput: {
    conversation_id: string
    display_state?: number
    likes_count?: number
    message: Message[]
    replies_count?: number
    school: School
  }
  authorAffiliationId: string
}

export interface AddCommentResponse {
  addComment: Comment
}

export const ADD_COMMENT = gql`
mutation ${QUERY_PREFIX}addComments($commentInput: AddCommentInputNoAuthor!, $authorAffiliationId: ID!){
  addComment(commentInput:$commentInput, authorAffiliationId: $authorAffiliationId) {
    ${COMMENT_FIELDS}
  }
}
`;
