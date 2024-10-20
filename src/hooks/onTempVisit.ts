import { useState, useEffect } from 'react';
import { VisitsResponse } from '../../types/interfaces';
import { useAppSelector } from '../../redux/hooks';

export function useTempVisit(visiteeId: string) {
  const [ visit, setVisit ] = useState<VisitsResponse|null>(null);
  const visits = useAppSelector(state => state.visits);
  useEffect(() => {
    if (visits[visiteeId]) {
      setVisit(visits[visiteeId] as VisitsResponse)
    } else {
      setVisit(null);
    }
  }, [visits])

  return visit;
}
