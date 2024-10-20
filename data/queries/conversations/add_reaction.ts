import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { Author, School, SchoolInput } from './types'

export enum ReactionPostingType {
  COMMENT = 'COMMENT',
  CONVERSATION = 'CONVERSATION',
  REPLY = 'REPLY',
}

export enum ReactionType {
  HEARTS = 'HEARTS',
  LIKES = 'LIKES',
  SMILES = 'SMILES'
}

export interface AddReactionInput {
  addReactionInput: {
    conversation_id: string
    posting_id: string
    posting_type: ReactionPostingType
    reaction_type: ReactionType
    school: SchoolInput
  }
  authorAffiliationId: string
}

export interface Reaction {
  id: string
  conversation_id: string
  reaction_type: ReactionType
  reaction_by: Author
  school: School
  posting_type: ReactionPostingType
  posting_id: string
  creation_date: string
  last_update_date: string
}

export interface AddReactionResponse {
  addReaction: Reaction
}

// eslint-disable-next-line import/prefer-default-export
export const ADD_REACTION = gql`
mutation ${QUERY_PREFIX}addReaction($addReactionInput:AddReactionInput!, $authorAffiliationId: ID!) {
  addReaction (reactionInput: $addReactionInput, authorAffiliationId: $authorAffiliationId) {
    id
    conversation_id
    creation_date
    last_update_date
    posting_id
    posting_type
    reaction_type
    school {
      id
      name
      year
    }
  }
}
`;

export interface GetReactionResponse {
  reactionByEntityId: Reaction | null
}

export const GET_REACTION = gql`
query ${QUERY_PREFIX}getReaction($entityId: ID!){
  reactionByEntityId(
    entityId: $entityId
  ) {
    id
    conversation_id
    creation_date
    last_update_date
    posting_id
    posting_type
    reaction_type
    school {
      id
      name
      year
    }
  }
}
`

