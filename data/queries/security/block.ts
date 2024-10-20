import { gql } from '@apollo/client';
import { PersonModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface BlockListPerson {
  _id: string
  personId: string
  creation_date: string
  person?: Partial<PersonModel>
}

interface BlockBaseStructure {
  owner: string
  blockedList: BlockListPerson[]
  blockingList: BlockListPerson[]
}
export interface BlockResponse {
  blockUser: BlockBaseStructure
}

export interface BlockedUsersResponse {
  blacklist: BlockBaseStructure | null
}

export interface BlockInput {
  personId: string
}

export const BLOCK_PROFILE = gql`
mutation ${QUERY_PREFIX}blockProfile($personId: ID!){
  blockUser(personId: $personId) {
    owner
    blockedList {
      _id
      personId
      creation_date
    }
  }
}`;

export const GET_BLOCK_LIST = gql`
query ${QUERY_PREFIX}getBlackList($personId: ID!){
  blacklist(
    personId: $personId
  ){
    owner
    blockedList {
      _id
      personId
      creation_date
      person {
        personId
        firstName
        lastName
        nowPhoto {
          id
          display {
            url
          }
        }
        thenPhoto {
          id
          display {
            url
          }
        }
      }
    }
  }
}
`
export const UNBLOCK_PROFILE = gql`
mutation ${QUERY_PREFIX}unblockProfile($personId: ID!){
  unblockUser(personId: $personId) {
    owner
    blockedList {
      _id
      personId
      creation_date
    }
    blockingList {
      _id
      personId
      creation_date
    }
  }
}`;
