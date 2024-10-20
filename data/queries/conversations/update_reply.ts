import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { REPLY_FIELDS } from './common';
import { Reply } from './types';

export interface UpdateReplyResponse {
  updateReply: Reply
}

export const UPDATE_REPLY = gql`
  mutation ${QUERY_PREFIX}updateReply($id: ID!, $message: [MessageBlockInput!]!) {
    updateReply(id: $id, message: $message) {
      ${REPLY_FIELDS}
    }
  }
`;
