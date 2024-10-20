import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'

export interface DeleteMyStoryArgs {
  id: string
}

export interface DeleteMyStoryResponse {
  deleteStory: {
    id: string
  }
}

export const DELETE_MY_STORY = gql`
mutation ${QUERY_PREFIX}deleteStory($id: ID!) {
  deleteStory(id:$id) {
    id
  }
}
`
