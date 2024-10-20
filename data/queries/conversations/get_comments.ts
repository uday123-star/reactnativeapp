import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { COMMENT_FIELDS } from './common'
import { Comment } from './types'

export interface GetCommentsResponse {
  comments: Comment[]
}

export const GET_COMMENTS = gql`
query ${QUERY_PREFIX}getComments($conversationId:ID!, $limit:Int) {
  comments(conversation_id:$conversationId, limit:$limit) {
    ${COMMENT_FIELDS}
  }
}
`
