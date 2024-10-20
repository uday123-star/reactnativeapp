import { gql } from '@apollo/client';
import { StudentModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface NewStudentsResponse {
  newStudents: {
    studentInfo: number
    studentsArray: StudentModel[]
  }
}

export interface StudentsResponse {
  student: {
    studentInfo: number
    studentsArray: StudentModel[]
  }
}

export const NEW_STUDENTS = gql`
query ${QUERY_PREFIX}getnewStudents($affiliationId: ID!, $limit: Int, $offset: Int) {
  newStudents(affiliationId: $affiliationId, limit: $limit, offset: $offset) {
    studentInfo
    studentsArray {
      id
      firstName
      lastName
      personId
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
      isBlocked @client
    }
  }
}`;

export const NEW_STUDENTS_BY_SCHOOL_AND_YEAR = gql`
query ${QUERY_PREFIX}getnewStudents($schoolId: ID!, $year: String!, $limit: Int, $offset: Int) {
  newStudents: newStudentsBySchoolAndYear(schoolId: $schoolId, year: $year, limit: $limit, offset: $offset) {
    studentInfo
    studentsArray {
      id
      firstName
      lastName
      personId
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
      isBlocked @client
    }
  }
}`;

export interface StudentsInfoResponse {
  student: {
    studentInfo: number
  }
}

export const STUDENTS_INFO = gql`
query ${QUERY_PREFIX}studentsInfo($schoolId: ID!, $year: String!, $affiliationAge: AffiliationAge){
  student(schoolId: $schoolId, year: $year, affiliationAge: $affiliationAge) {
    studentInfo
  }
}
`;

export const GET_STUDENTS = gql`
query ${QUERY_PREFIX}getStudents($year: String!, $schoolId: ID!, $limit: Int, $offset: Int) {
  student(year: $year, schoolId: $schoolId, limit: $limit, offset: $offset) {
    studentInfo
    studentsArray{
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
      isBlocked @client
    }
  }
}
`;
