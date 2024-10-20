import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants'
import { CONVERSATION_FIELDS } from './common';
import { Conversation } from './types';

export interface DeleteConversationResponse {
  deleteConversation: Conversation
}

// eslint-disable-next-line import/prefer-default-export
export const DELETE_POST = gql`
  mutation ${QUERY_PREFIX}deletePost($id: ID!) {
    deleteConversation(id: $id) {
      ${CONVERSATION_FIELDS}
    }
  }
`;
