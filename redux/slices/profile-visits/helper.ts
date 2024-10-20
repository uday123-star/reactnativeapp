import { VisitReceived } from '../../../data/queries/profile-visits/fetch';
import { compareAsc, subDays, parse } from 'date-fns';

type GetRecentVisitsResult = [
  recentVisits: VisitReceived[],
  oldVisits: VisitReceived[]
]

interface Args {
  daysThreshold?: number
  allProfileVisits: VisitReceived[]
  maxRecentVisits?: number
}

const MAXIMUM_RECENT_VISITS = 80;

export const getRecentVisitsFrom = ({ allProfileVisits = [], daysThreshold = 90, maxRecentVisits = MAXIMUM_RECENT_VISITS }: Args): GetRecentVisitsResult => {
  let recentVisits: VisitReceived[] = [];
  let oldVisits: VisitReceived[] = [];

  // @see https://date-fns.org/v2.27.0/docs/subDays
  const THRESHOLD = subDays(Date.now(), daysThreshold);

  // iterate through all visits
  allProfileVisits.forEach(visit => {
    const visitDate = parse(visit.visitDate, 'yyyy-MM-dd', new Date());

    // @see https://date-fns.org/v2.27.0/docs/compareAsc
    const isRecent = compareAsc(visitDate, THRESHOLD) === 1;

    if (recentVisits.length < maxRecentVisits && isRecent) {
      recentVisits = [...recentVisits, visit];
    } else {
      oldVisits = [...oldVisits, visit];
    }
  })

  return [recentVisits, oldVisits];
}
