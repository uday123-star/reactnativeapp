import { useCallback } from 'react';
import { VisitsResponse } from '../../types/interfaces';
import { logVisit as logVisitHelper } from '../helpers/visits';

export const useLogVisit = () => {
  const logVisit = useCallback((visitArgs: VisitsResponse) => {
    logVisitHelper(visitArgs);
  }, []);
  return logVisit;

}
