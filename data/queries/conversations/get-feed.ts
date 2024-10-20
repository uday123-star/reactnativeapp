import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { CONVERSATION_FIELDS } from './common'
import { Conversation } from './types'

export interface ConversationAuthor {
  name: string
  photo: string
  registration_id: string
}

export interface ConversationsFeedResponse {
  conversationsFeed: Conversation[]
}

export interface ConversationsFeedPaginationResponse {
  canPaginateConversationsFeed: boolean
}

export const GET_FEED = gql`
query ${QUERY_PREFIX}ConversationsFeed($gradYear:Float, $yearRange: String, $schoolId:ID!, $limit: Int, $offset: Int, $lastId: ID) {
  conversationsFeed(gradYear:$gradYear, yearRange:$yearRange, schoolId:$schoolId, limit: $limit, offset: $offset, lastId: $lastId) {
    ${CONVERSATION_FIELDS}
  }
}
`;
export const GET_FEED_PAGINATION = gql`
query ${QUERY_PREFIX}ConversationsFeedPagination($gradYear:Float!, $schoolId:ID!, $limit: Int, $offset: Int, $lastId: ID) {
  canPaginateConversationsFeed(gradYear:$gradYear, schoolId:$schoolId, limit: $limit, offset: $offset, lastId: $lastId)
}
`;
