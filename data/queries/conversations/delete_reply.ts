import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { REPLY_FIELDS } from './common';
import { Reply } from './types';

export interface DelReplyResponse {
  deleteReply: Reply
}

export const DELETE_REPLY = gql`
mutation ${QUERY_PREFIX}deleteReply($id: ID!){
  deleteReply(id:$id) {
    ${REPLY_FIELDS}
  }
}
`;
