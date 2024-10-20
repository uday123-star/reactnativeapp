import { RootState } from '../../store';
import { profileVisitsAdapter } from './slice';
import { subDays, compareAsc, parse } from 'date-fns';
import { VisitReceived } from '../../../data/queries/profile-visits/fetch';

// @see https://date-fns.org/v2.27.0/docs/subDays
const THRESHOLD = subDays(Date.now(), 30);

const { selectAll } = profileVisitsAdapter.getSelectors<RootState>((state) => state.profileVisits);

export const selectAllProfileVisits = selectAll;

export const selectRecentProfileVisits = (rootState: RootState): VisitReceived[] => {
  const allProfileVisits = selectAllProfileVisits(rootState);

  return allProfileVisits.filter((visit) => {
    const visitDate = parse(visit.visitDate, 'yyyy-MM-dd', new Date());

    // @see https://date-fns.org/v2.27.0/docs/compareAsc
    return compareAsc(visitDate, THRESHOLD) === 1;
  })
};
