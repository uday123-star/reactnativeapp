import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { REPLY_FIELDS } from './common'
import { Reply } from './types'

export interface FetchRepliesResponse {
  replies: Reply[]
}

export const FETCH_REPLIES = gql`
query ${QUERY_PREFIX}fetchReplies($commentId:ID!, $limit:Int) {
  replies(comment_id:$commentId, limit:$limit) {
    ${REPLY_FIELDS}
  }
}
`
