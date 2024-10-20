import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants'
import { CONVERSATION_FIELDS } from './common';
import { Conversation, Message, SchoolInput } from './types';

export interface MessageBlockInput {
  text: string
  entityRanges: []
}

export interface CreateConversationInput {
  conversation: {
    comments_count?: number
    display_state?: number
    likes_count?: number
    message: Message[]
    school: SchoolInput
  }
  authorAffiliationId: string
}

export interface CreateConversationResponse {
  createConversation: Conversation
}

// eslint-disable-next-line import/prefer-default-export
export const ADD_CONVERSATION = gql`
  mutation ${QUERY_PREFIX}submitPost($conversation: CreateConversationInputNoAuthor!, $authorAffiliationId: ID!) {
    createConversation(conversationInput: $conversation, authorAffiliationId: $authorAffiliationId) {
      ${CONVERSATION_FIELDS}
    }
  }
`;
