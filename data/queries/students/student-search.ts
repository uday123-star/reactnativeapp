import { gql } from '@apollo/client';
import { StudentModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { getPhotosCommonFields } from '../photos/common';

export type SearchStudent = StudentModel

export interface SearchStudentArgs {
  schoolId: string
  year: string
  text: string
}

export interface SearchStudentAffiliation {
  id: string
  studentInfo: number
  students: SearchStudent[]
}

export interface SearchStudentsResponse {
  searchStudents: SearchStudent[]
}

export const SEARCH_STUDENTS = gql`
query ${QUERY_PREFIX}searchStudents($schoolId: ID!, $year: String!, $text: String!) {
  searchStudents(
    schoolId: $schoolId,
    year: $year,
    text: $text
  ) {
    id
    firstName
    lastName
    personId
    schoolId
    gradYear
    hasBirthdateAvailable
    school{
      schoolName
    }
    nowPhoto {
      id
      display{
        url
        width
        height
      }
    }
    thenPhoto {
      id
      display {
        url
        width
        height
      }
    }
    photos(limit: 20) {
      ${getPhotosCommonFields(false)}
    }
    visits {
      namedCount
      totalCount
      newCount
    }
  }
}`;


