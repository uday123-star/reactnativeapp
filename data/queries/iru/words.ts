import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { BasicInfoResponse } from '../general';
import { IruTag } from './tags';

export interface IruTagsInfoResponse extends BasicInfoResponse {
  newCount?: number
}

export interface IruWord {
  id: string
  iruTags: IruTag[]
  word: string
}

export interface IruWordsResponse {
  iruWords: {
    info?: IruTagsInfoResponse
    records?: IruWord[]
  }
}

export interface GetIruWordsInput {
  personId: string
  limit: number
  offset: number
}

export const GET_IRU_WORDS = gql`
query ${QUERY_PREFIX}getIruWords($personId: ID!, $limit: Int, $offset: Int) {
  iruWords(personId: $personId, limit: $limit, offset: $offset) {
    records {
      id
      iruTags {
        iruTagId
      }
      word
    }
  }
}
`;

export interface Iru {
  id: string
  style: string
  word: string
}

export interface AvailableIruWordsResponse {
  iru: Iru[]
}

export const GET_AVAILABLE_IRU_WORDS = gql`
query ${QUERY_PREFIX}{
  iru {
    id
    style
    word
  }
}
`;
