import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { CONVERSATION_FIELDS } from './common';
import { Conversation } from './types';

export interface ConversationResponse {
  conversation: Conversation
}

export const GET_CONVERSATION = gql`
query ${QUERY_PREFIX}getConversation($id: ID!) {
  conversation(id: $id) {
    ${CONVERSATION_FIELDS}
  }
}
`;
