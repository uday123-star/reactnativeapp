import findIndex from 'lodash/findIndex';
import { StudentModel } from '../../../types/interfaces';

/**
 * Converts the four digit gradYear to a string.
 *
 * Example: gradYear = 1986
 * Returns: Class of 1986
 * @param gradYear The four digit gradyear
 * @returns string
 */
export const getClassTitle = function(gradYear: string, isStudent = true, startYear = '', short = false): string {
  if (short) {
    return isStudent ? `Class of '${gradYear.slice(2)}` : `Classes '${startYear.slice(2)}-'${gradYear.slice(2)}`;
  }
  return isStudent ? `Class of ${gradYear}` : `Classes ${startYear}-${gradYear}`;
}

/**
 * Converts startYear and endYear to a string
 *
 * Example: startYear = 1983; endYear = 1986
 * Returns: Class of '83-'86
 * @param startYear The 4 digit startYear
 * @param endYear The 4 digit endYear
 * @returns string
 */
 export const getYearsAttendedTitle = function(startYear: string, endYear: string, isStudent = true): string {
  return isStudent ? `Class of '${startYear.slice(-2)}-'${endYear.slice(-2)}` : `'${startYear.slice(-2)}-'${endYear.slice(-2)}`;
}

/**
 * Generates a string representation of the number of classmates.
 *
 * Example:  Givin a collection of 99 students
 * Returns: 99 People
 * @param collection collection of classmates
 * @returns string
 */
export const getClassCountString = function(studentCount: number): string {

  if (!studentCount) {
    return '0 People';
  }

  const modifier = studentCount === 1 ? 'Person' : 'People';

  return `${studentCount} ${modifier}`;
}

/**
 * Sorts a collection of students by first or last name.
 *
 * Example: Givin a query: 'dav'
 * Returns: A collection of users with firstNames like David, and lastNames like Davis'
 * @param students StudentModel[]
 * @param query string
 * @returns StudentModel[]
 */
export const filterStudentsByFirstOrLast = function(students: StudentModel[], query: string): StudentModel[] {
  return students.filter(student => {
    const { firstName, lastName } = student;
    const _query = query.toLowerCase();
    const _firstName = firstName.toLowerCase();
    const _lastName = lastName.toLowerCase();

    return _firstName.startsWith(_query) || _lastName.startsWith(_query);
  });
}

/**
 * Takes a collection of students, and finds the index, based on the search
 * @param collection
 * @param search
 * @returns
 */
export const findIndexFromStudents = function(collection: StudentModel[], search: { id: string }): number {
  return findIndex(collection, search) || 0;
}

interface NativeEvent {
  layoutMeasurement: {
    height: number
    width: number
  }
  contentSize: {
    height: number
    width: number
  }
  contentOffset: {
    x: number
    y: number
  }
  zoomScale: number
  contentInset: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/**
 * Helper fn for detecting when the classlist scrollbar gets to the bottom.
 * Returns true when scrolled within the threshold of bottom. False otherwise.
 * @param threshold Number of pixels from bottom to fire event
 * @param nativeEvent
 * @returns boolean
 */
export const isCloseToBottom = (threshold = 20, { layoutMeasurement, contentOffset, contentSize }: NativeEvent): boolean => {
  // const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - threshold;
}

/**
 * Compares the total number of students in the affiliation. True if can load
 * more students, otherwise false. Indended for use in the view layer.
 * @param totalStudentCount total number of students ( from affiliationSlice )
 * @param studentsLoadedCount total number of students loaded ( from studentSlice )
 * @returns
 */
export const canLoadMoreStudents = (totalStudentCount: number, studentsLoadedCount: number): boolean => {
  return totalStudentCount > studentsLoadedCount;
}


export const emptyStudent = (): StudentModel => {
  return {
    firstName: '',
    lastName: '',
    id: '',
    gradYear: '',
    personId: '',
    birthDate: '',
    hasBirthdateAvailable: false,
    birthDateConfidenceLevel: 0,
    visits: {
      namedCount: 0,
      newCount: 0,
      totalCount: 0,
    },
  }
}

export const mockStudent = ({
  firstName,
  lastName,
  id,
  gradYear,
  personId,
  birthDate,
}: Partial<StudentModel>): StudentModel => {
  return {
    firstName: firstName || 'John',
    lastName: lastName || 'Example',
    id: id || '12345',
    gradYear: gradYear || '1980',
    personId: personId || '12345',
    birthDate: birthDate || '1988-12-12',
    hasBirthdateAvailable: false,
    birthDateConfidenceLevel: 0,
    visits: {
      namedCount: 0,
      newCount: 0,
      totalCount: 0
    }
  }
}
