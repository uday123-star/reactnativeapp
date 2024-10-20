import { gql } from '@apollo/client';
import { Photo } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { BASIC_PERSON_FIELDS } from './common';

export interface VisitsCount {
  namedCount: number
  totalCount: number
  newCount: number
}

interface PersonModel {
  id: string
  firstName: string
  lastName: string
  nowPhoto: Photo
  thenPhoto: Photo
  visits?: VisitsCount
  isFriend?: boolean
  isCommunityMember?: boolean
}

export interface PeopleResponse {
  people: PersonModel[]
}

export const GET_PEOPLE = gql`
  query ${QUERY_PREFIX}getPerson($personId: ID) {
    people(id: $personId) {
      ${BASIC_PERSON_FIELDS}
    }
  }
`;

export const GET_FRIENDSHIP = gql`
  query ${QUERY_PREFIX}getPerson($personId: ID!, $schoolId: ID!) {
    people(id: $personId) {
      isFriend
      isCommunityMember(schoolId: $schoolId)
    }
  }
`;
