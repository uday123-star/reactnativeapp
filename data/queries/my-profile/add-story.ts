import { gql } from '@apollo/client'
import { Story, StoryVisibleState } from '../../../types/interfaces'
import { QUERY_PREFIX } from '../constants'

export interface AddStoryArgs {
  text: string
  visibleState?: StoryVisibleState
}

export interface AddStoryResponse {
  addStory: Story
}

export const ADD_STORY = gql`
mutation ${QUERY_PREFIX}addStory($text:String!, $visibleState:VisibleState) {
  addStory(text:$text,visibleState:$visibleState) {
    text
    owner
    id
    visibleState
  }
}
`
