import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';
import { IruTagsInfoResponse } from './words';

export interface IruTag {
  iruTagId: string
  recipient?: string
  taggedDate?: string
  tagger?: string
  words?: string[]
}

export interface TaggedIrusResponse {
  iruTagsReceivedOrPosted: {
    info?: IruTagsInfoResponse
    records?: IruTag[]
  }
}

export const GET_TAGGED_IRUS = gql`
query ${QUERY_PREFIX}getTaggedIrus($personId: ID!) {
  iruTagsReceivedOrPosted(
    currentUser: true,
    iruRole: TAGGER
    filters: {
      recipient: $personId
    }
  ) {
    records {
      iruTagId
      recipient
      taggedDate
      tagger
      words
    }
  }
}
`;

export interface addIruTagInput {
  personId: string
  tagger: string
  words: string[]
}

export interface addIruTagResponse {
  addIruTag: IruTag
}

export const ADD_TAG_TO_USER = gql`
mutation ${QUERY_PREFIX}addIruTag($personId: ID!, $tagger: ID!, $words: [ID!]!) {
  addIruTag(
    personId: $personId,
    tagger: $tagger,
    words: $words
  ) {
    iruTagId
    recipient
    taggedDate
    tagger
    words
  }
}
`;

export interface removeIruWordInput {
  tagId: string
  words: string[]
}

export interface removeIruWordResponse {
  updateIruTag: IruTag
}

export const REMOVE_IRU_WORDS = gql`
mutation ${QUERY_PREFIX}removeWordsFromTag($tagId: ID!, $words: [ID!]!) {
  updateIruTag(iruTagId: $tagId, words: $words) {
    iruTagId
    recipient
    taggedDate
    tagger
    words
  }
}
`;
