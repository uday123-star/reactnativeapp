import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { COMMENT_FIELDS, REPLY_FIELDS } from './common'
import { Comment } from './types'

export interface GetCommentResponse {
  comment: Comment
}

export const GET_COMMENT_WITH_REPLIES = gql`
query ${QUERY_PREFIX}getCommentWithReplies($id:ID!) {
  comment(id:$id) {
    ${COMMENT_FIELDS}
    replies {
      ${REPLY_FIELDS}
    }
  }
}
`
