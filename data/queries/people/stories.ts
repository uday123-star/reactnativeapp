import { gql } from '@apollo/client'
import { Story } from '../../../types/interfaces'
import { QUERY_PREFIX } from '../constants';

export interface StoriesArgs {
  owner: string
}

export interface StoriesResponse {
  stories: Story[]
}

export const STORIES = gql`
query ${QUERY_PREFIX}getStories($owner: ID){
  stories(owner: $owner){
    id
    text
    owner
    visibleState
  }
}`;
