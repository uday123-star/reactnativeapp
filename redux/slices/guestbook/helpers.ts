import { getStickyItemFromMapByString } from '../../../src/helpers/array';

export function selectWeebleByRegId(regId: string | number, map: Map<number, JSX.Element>): JSX.Element {
  return getStickyItemFromMapByString<JSX.Element>(map, String(regId));
}

/**
 * Takes an image ref, and a map of items, and returns
 * an item.
 * @param imageRef
 * @param map
 * @returns
 */
export function getBlurredImageBy(imageRef: number, map: Map<number, string>): string {
  return map.get(imageRef) as string;
}

