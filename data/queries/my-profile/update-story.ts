import { gql } from '@apollo/client'
import { Story } from '../../../types/interfaces'
import { QUERY_PREFIX } from '../constants'

export interface UpdateStoryArgs {
  text: string
  id: string
}

export interface UpdateStoryResponse {
  updateStory: Story
}

export const UPDATE_MY_STORY = gql`
mutation ${QUERY_PREFIX}updateStory($text:String!,$id: ID!) {
  updateStory(text:$text,id:$id) {
    id
    text
    owner
    visibleState
  }
}
`
