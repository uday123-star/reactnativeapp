import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { REPLY_FIELDS } from './common';
import { Message, Reply, School } from './types';

export interface AddReplyInputNoAuthor {
  replyInput: {
    comment_id: string
    display_state?: number
    likes_count?: number
    message: Message[]
    replies_count?: number
    school: School
  }
  authorAffiliationId: string
}

export interface AddReplyResponse {
  addReply: Reply
}

export const ADD_REPLY = gql`
mutation ${QUERY_PREFIX}addReply($replyInput: AddReplyInputNoAuthor!, $authorAffiliationId: ID!){
  addReply(replyInput:$replyInput, authorAffiliationId: $authorAffiliationId) {
    ${REPLY_FIELDS}
  }
}
`;
