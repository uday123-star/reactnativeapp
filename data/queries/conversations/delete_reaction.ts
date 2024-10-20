import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'
import { Reaction } from './add_reaction';

export interface DeleteReactionResponse {
  deleteReaction: Reaction
}

// eslint-disable-next-line import/prefer-default-export
export const DELETE_REACTION = gql`
mutation ${QUERY_PREFIX}deleteReaction($id:ID!) {
  deleteReaction (id:$id) {
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
