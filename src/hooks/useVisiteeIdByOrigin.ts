import { makeVar, useReactiveVar } from '@apollo/client';
import { VisitOrigin } from '../../types/interfaces';

type screenName = string;
/**
 * This is a template type for generating and index like this:
 * SCREENNAME:profile:people
 * SCREENNAME:carousel:home
 * SCREENNAME:photo_carousel:photos
 * 
 * Resulting on something similar to this:
 * _carousel:profile:people
 * _fullProfile:profile:people
 * _myProfileRoot:profile:people
 * 
 * Having identified sources allow the visitBar to correctly detect
 * the focused visitee and avois overriding the info when a visit
 * is been called after loading a different screen
 */
type ScreenAndVisitOrigin = `${screenName}:${VisitOrigin}`
export type VisitByOrigin = {
  [origin in ScreenAndVisitOrigin]?: string
};

export const VisiteesByOrigin = makeVar<VisitByOrigin>({});

export const useVisiteeIdByOrigin = (origin: ScreenAndVisitOrigin) => {
  const visits = useReactiveVar(VisiteesByOrigin);
  return visits[origin];
}
