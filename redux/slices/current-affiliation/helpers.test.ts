import { findIndexFromStudents, filterStudentsByFirstOrLast } from './helpers'
import mockStudents from '../../../data/mock/students'

describe('helpers/current-affiliation', () => {
  test('can get the index of a student from collection of students', () => {
    const id = mockStudents[2].id;
    const index = findIndexFromStudents(mockStudents, { id });
    expect(index).toBe(2);
  });

  test('can find a student by first name', () => {
    const firstName = mockStudents[2].firstName;
    const students = filterStudentsByFirstOrLast(mockStudents, firstName);
    expect(students[0].firstName).toBe(firstName);
  });

  test('can find a student by last name', () => {
    const lastName = mockStudents[1].lastName;
    const students = filterStudentsByFirstOrLast(mockStudents, lastName);
    expect(students[0].lastName).toBe(lastName);
  })
})
