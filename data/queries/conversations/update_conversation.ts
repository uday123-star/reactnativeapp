import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { CONVERSATION_FIELDS } from './common';
import { Conversation } from './types';

export interface UpdateConversationResponse {
  updateConversation: Conversation
}

export const UPDATE_CONVERSATION = gql`
  mutation ${QUERY_PREFIX}updateConversation($id: ID!, $message: [MessageBlockInput!]!) {
    updateConversation(id: $id, message: $message) {
      ${CONVERSATION_FIELDS}
    }
  }
`;
