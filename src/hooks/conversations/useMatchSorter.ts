import { matchSorter } from 'match-sorter';
import { useMemo } from 'react';
import { PersonModel, StudentModel } from '../../../types/interfaces';

export function useMatchSorter<T = StudentModel | PersonModel>(
  collection: T[],
  query: string,
) {
  return useMemo(() => {
    return matchSorter(collection, query, {
      keys: ['firstName', 'lastName']
    })
  }, [collection, query]);
}
