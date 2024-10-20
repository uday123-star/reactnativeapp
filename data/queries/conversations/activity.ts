import { gql } from '@apollo/client'
import { AffiliationModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants'
import { Author } from './types';

export enum NotificationAction {
  POSTED = 'POSTED',
  REACTED = 'REACTED',
}

export enum NotificationPostingType {
  CONVERSATION = 'CONVERSATION',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
}

export interface NotificationRecord {
  conversation_id: string
  comment_id?: string
  reply_id?: string
  parent_posted_by: Author
  actor: Author
  author_affiliation?: AffiliationModel[]
  actor_affiliation?: AffiliationModel[]
  action: NotificationAction
  posting_type: NotificationPostingType
  posting_id: string
  creation_date: Date
  post_snippet?: string
}

export interface ConversationsActivityResponse {
  conversationsSiteNotifications: NotificationRecord[]
}

export const GET_CONVERSATIONS_ACTIVITY = gql`
query ${QUERY_PREFIX}conversationsActivity(
    $authorId: ID!
    $gradYear: Float
    $yearRange: String
    $schoolId: ID!
    $limit: Int
) {
    conversationsSiteNotifications(
        authorId: $authorId
        gradYear: $gradYear
        yearRange: $yearRange
        schoolId: $schoolId
        limit: $limit
        mobile: true
    ) {
        action
        actor {
            name
            photo
            registration_id
        }
        actor_affiliation {
          gradYear
        }
        author_affiliation {
          gradYear
        }
        comment_id
        conversation_id
        creation_date
        parent_posted_by {
            name
            registration_id
        }
        post_snippet
        posting_id
        posting_type
        reply_id
    }
}
`;
