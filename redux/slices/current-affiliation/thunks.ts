import { createAsyncThunk } from '@reduxjs/toolkit';
import { AffiliationModel } from '../../../types/interfaces';
import { RootState } from '../../store';
import { affiliationsSelectors } from '../all-affiliations/slice';
import { emptyAffiliation } from '../all-affiliations/helpers';

export const selectCurrentAffiliationThunk = createAsyncThunk<
  AffiliationModel,
  { usePrimary?: boolean; affiliationId?: string },
  {
    state: RootState
  }
>(
  'current-affiliation/selectCurrentAffiliation',
  async ({ usePrimary = false, affiliationId }, thunkApi) => {
    const { allAffiliations: allAffiliationsState } = thunkApi.getState();
    const allAffiliations = affiliationsSelectors.selectAll(allAffiliationsState);
    let currentAffiliation;

    if (usePrimary) {
      // select our primary affiliation
      currentAffiliation = allAffiliations.find(affiliation => affiliation.primary) || allAffiliations[0];
    }

    if (affiliationId) {
      // set current affiliation here
      currentAffiliation = affiliationsSelectors.selectById(allAffiliationsState, +affiliationId);
    }

    return currentAffiliation || emptyAffiliation;
  }
);
