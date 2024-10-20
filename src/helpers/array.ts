/**
 * Converts the string to a 32 bit number.
 * @param base
 * @param string
 * @returns
 */
export function convertTo32BitHash(id: string | number): number {
  let hash = 0, i: number, chr: number, len: number;
  const string = String(id)

  for (i = 0, len = string.length; i < len; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

/**
 * Converts a number, to a string in the specified radix.
 * @param base
 * @param number
 * @returns
 */
export function convertToStringRadix(base: number, number: number): string {
  return number.toString(base).split('').pop() || '';
}

export function getStickyItemFromMapByString<t>(map: Map<number, t>, regId: string): t {
  const hash = convertTo32BitHash(regId);
  const index = +convertToStringRadix(map.size, hash);

  return map.get(index) as t;
}
