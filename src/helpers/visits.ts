import { ApolloError } from '@apollo/client';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { formatDistanceStrict, isSameDay, subDays } from 'date-fns';
import { VisitsResponse, VisitTypeEnum } from '../../types/interfaces';
import { logEvent } from './analytics';
import { parseIsoString } from './dates';

const {
  anonymous,
  normal,
  permanent,
  deleted
} = VisitTypeEnum;

export enum VisitButtonState {
  Loading,
  CanAddVisit,
  CanRemoveVisit,
  Permanent,
  Error
}

export const getTimeAgo = ({ visitData }: { visitData: VisitsResponse|undefined }) => {
  if (!visitData) {
    return ''
  }

  const standardDate = parseIsoString(visitData?.visitDate);
  const now = new Date();
  const formatedTimeAgo = formatDistanceStrict(standardDate, now, {
    unit: 'day',
    addSuffix: false,
  });
  return isSameDay(standardDate, now) ? 'today' :
    isSameDay(standardDate, subDays(now, 1)) ? 'yesterday' :
      `${formatedTimeAgo} ago`;
}

const isUpgradable = (visitType: VisitTypeEnum | undefined): boolean => {
  if (visitType) {
    return [anonymous, deleted].includes(visitType)
  }
  return false
}

const isNormal = (visitType: VisitTypeEnum | undefined): boolean => {
  return visitType === normal;
}

const isPermanent = (visitType: VisitTypeEnum | undefined): boolean => {
  return visitType === permanent;
}

export const getVisitButtonState = (data: VisitsResponse | null | undefined, error: ApolloError | undefined = undefined, loading = false,) => {
  if (!data) return VisitButtonState.Loading;

  switch (true) {
    case loading:
      return VisitButtonState.Loading
    case isUpgradable(data.visitType):
      // console.log('can make permanaent visit')
      return VisitButtonState.CanAddVisit
    case isNormal(data.visitType):
      // console.log('is removable visit')
      return VisitButtonState.CanRemoveVisit
    case isPermanent(data.visitType):
      // console.log('is permanent visit')
      return VisitButtonState.Permanent
    default:
      if (error) {
        // console.log('error while getting visit button state :: ', error)
        DdRum.addError(
          error.message || 'error while getting visit button state',
          ErrorSource.CUSTOM,
          error.stack || __filename,
          { error, data },
          Date.now()
        )
      }
      console.error('default visit type :: ', data.visitType)
      return VisitButtonState.Error
  }
}

export const logVisit = (visit: VisitsResponse) => {
  const { normal, anonymous } = VisitTypeEnum;
  const { visitType, visitorId, visiteeId, visitOrigin } = visit;

  const visitEvent = {
    visitorId,
    visiteeId,
    visitId: visit.id,
    originName: visitOrigin,
    isAnonymous: visitType === anonymous,
  };
  if ([normal, anonymous].includes(visitType)) {
    logEvent('guestbook_signature', visitEvent);
  }
}

