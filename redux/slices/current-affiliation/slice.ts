import { createAction, createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit'
import { AffiliationModel, StudentModel } from '../../../types/interfaces';
import { emptyAffiliation } from '../all-affiliations/helpers';
import { filterStudentsByFirstOrLast } from './helpers';

export const currentAffiliationAdapter = createEntityAdapter({
  selectId: (student: StudentModel) => student.id
});

export interface CurrentAffiliationState extends EntityState<StudentModel> {
  isLoading: boolean
  currentAffiliation: AffiliationModel
  sortedStudents: StudentModel[]
  hasMoreStudentsOnServer: boolean
  sortQuery: string
  offset: number
  limit: number
  focusedStudent?: StudentModel
}

const initialState: CurrentAffiliationState = currentAffiliationAdapter.getInitialState({
  isLoading: false,
  currentAffiliation: emptyAffiliation,
  sortedStudents: [],
  hasMoreStudentsOnServer: true,
  sortQuery: '',
  offset: 0,
  limit: 100
});

export const currentAffiliationSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    focusStudent(state, { payload }: { payload: StudentModel }) {
      return {
        ...state,
        focusedStudent: payload
      }
    },
    sortStudents(state, { payload }) {
      const { query: q = '' } = payload;
      // TODO - should be in a thunk, because it's async
      // TODO - memoize this search
      // TODO - Continue to filter all results locally, when q.length is > 1.
      // alert('search students with limit=0 and startLetter = q ');
      const students = studentsSelectors.selectAll(state);
      const sortedStudents = q.length ? filterStudentsByFirstOrLast(students, q) : students;
      return {
        ...state,
        sortQuery: q,
        sortedStudents
      }
    },
    removeStudent(state, { payload }: {
      payload: StudentModel
    }) {
      currentAffiliationAdapter.removeOne(state, payload.id);
      const index = state.sortedStudents.findIndex((student) => student.personId === payload.personId);
      state.sortedStudents.splice(index, 1)
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createAction('current-affiliation/selectCurrentAffiliation/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addCase(
        createAction('current-affiliation/selectCurrentAffiliation/rejected'),
        (state) => {
          console.log('kaboom, an error happened');
          state.isLoading = false;
        }
      )
      .addCase(
        createAction<AffiliationModel>('current-affiliation/selectCurrentAffiliation/fulfilled'),
        (state, { payload }) => {
          const { sortQuery: q = '' } = state;
          state.currentAffiliation = payload;
    
          // Whenever we select the currentAffiliation, it's important
          // to setAll students. (setMany would cause students from the
          // wrong school to show in the classlist)
          currentAffiliationAdapter.setAll(state, payload.students || []);
    
          // If we load a new affiliation
          // reset the offset after loading students
          state.offset = state.ids.length + 1;
    
          // always calculate hasMore
          const allStudents = currentAffiliationAdapter.getSelectors().selectAll(state);
          state.hasMoreStudentsOnServer = state.currentAffiliation.studentInfo > allStudents.length;
    
          // after setting all students, we call the fn to sort,
          // this enables the UI. ( its reactive, based on sortedStudents)
          state.sortedStudents = q.length ? filterStudentsByFirstOrLast(payload.students || [], q) : payload.students || [];
    
          state.isLoading = false;
        }
      );
  }
});

export default currentAffiliationSlice.reducer;

export const { sortStudents, focusStudent, removeStudent } = currentAffiliationSlice.actions;

export const studentsSelectors = currentAffiliationAdapter.getSelectors();
