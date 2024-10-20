import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { emptyAffiliation } from './helpers';
import { AffiliationModel } from '../../../types/interfaces';

const affiliationsAdapter = createEntityAdapter({
  selectId: (affiliation: AffiliationModel) => affiliation.id
});

export interface State extends EntityState<AffiliationModel> {
  // additional entities state properties
  isLoading: boolean
  isSchoolDropdownModalVisible: boolean
  currentAffiliation: AffiliationModel
}

const initialState: State = affiliationsAdapter.getInitialState({
  isLoading: false,
  isSchoolDropdownModalVisible: false,
  currentAffiliation: emptyAffiliation,
})

export const affiliationsSlice = createSlice({
  name: 'affiliations',
  initialState,
  reducers: {
    setAllAffiliations(state, { payload }: {
      payload: AffiliationModel[]
    }) {
      const affiliations = payload;
      affiliationsAdapter.setAll(state, affiliations);
    },
    hideSchoolDropdownModal(state) {
      return {
        ...state,
        isSchoolDropdownModalVisible: false
      }
    },
    showSchoolDropdownModal(state) {
      return {
        ...state,
        isSchoolDropdownModalVisible: true
      }
    },
    selectCurrentAffiliation(state, action: PayloadAction<{affiliationId?: string; usePrimary?: boolean}>): State {
      const { affiliationId = '', usePrimary = false } = action.payload;
      let currentAffiliation;
      if (usePrimary) {
        const { selectAll } = affiliationsAdapter.getSelectors()
        const affiliations = selectAll(state);
        currentAffiliation = affiliations.filter(affiliation => affiliation.primary)[0];
      } else {
        const { selectById } = affiliationsAdapter.getSelectors();
        // set current affiliation here
        currentAffiliation = selectById(state, affiliationId) || emptyAffiliation;
      }

      return {
        ...state,
        currentAffiliation,
      }
    }
  }
});

export default affiliationsSlice.reducer;

export const { hideSchoolDropdownModal, showSchoolDropdownModal, selectCurrentAffiliation, setAllAffiliations } = affiliationsSlice.actions;

export const affiliationsSelectors = affiliationsAdapter.getSelectors();
