import { VisitOrigin } from '../../types/interfaces';
import { isIOS } from '../helpers/device';

export const useVisitOrigin = (origin: VisitOrigin): `${VisitOrigin}:ios` | `${VisitOrigin}:android` => {
  return `${origin}:${isIOS() ? 'ios' : 'android'}`;
}
