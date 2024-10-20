import { useCurrentAffiliation } from '../../redux/hooks';

export function useAffiliationYearRange(): {
  range: string
  start: string
  end: string
  years: string[]
  isStudent: boolean
  classText: string
} {
  const { startYear, endYear, gradYear, role } = useCurrentAffiliation();
  const rangeEnd = gradYear || endYear;
  const isStudent = role === 'STUDENT';
  const years = [];
  const start = Number(startYear);
  let end = Number(rangeEnd);
  while (end >= start) {
    years.push(String(end));
    end--;
  }
  return {
    range: `${startYear}-${rangeEnd}`,
    start: String(startYear),
    end: String(rangeEnd),
    years,
    isStudent,
    classText: isStudent ? `Class of ${rangeEnd}` : `${startYear}-${rangeEnd}`
  };
}
