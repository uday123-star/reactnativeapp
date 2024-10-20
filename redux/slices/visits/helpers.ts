export const hasVisitedProfile = (visiteeId = '', myVisits: string[] = []): boolean => {
  return myVisits.includes(String(visiteeId));
}
