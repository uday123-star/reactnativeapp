import { gql } from '@apollo/client';
import { AFFILIATION_DETAILS_FIELDS } from '../affiliations/common';
import { QUERY_PREFIX } from '../constants';
import { Reaction, ReactionPostingType, ReactionType } from './add_reaction';

export interface ReactionsResponse {
  reactionsByFilter: Reaction[]
}

export interface ReactionsInput {
  postingId: string
  postingType: ReactionPostingType
  reactionType: ReactionType
  limit: number
  offset: number
}

export const GET_REACTIONS = gql`
query ${QUERY_PREFIX}getReactions(
  $postingId: String!,
  $postingType: ReactionPostingType!,
  $reactionType: ReactionType!,
  $limit: Int!,
  $offset: Int!
){
  reactionsByFilter(
    posting_id: $postingId,
    posting_type: $postingType,
    reaction_type: $reactionType,
    limit: $limit,
    offset: $offset
  ) {
    id
    conversation_id
    creation_date
    last_update_date
    posting_id
    posting_type
    reaction_by {
      name
      photo
      registration_id
      affiliation {
        ${AFFILIATION_DETAILS_FIELDS}
      }
    }
    reaction_type
    school{
      id
      name
      year
    }
  }
}
`;
