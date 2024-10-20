interface TitleizeOptions {
  noWrap?: boolean
}

/**
 * Converts a string to title case.
 * Example: this is a funky string.
 *  => This Is A Funky String
 * @param string the string to convert
 * @param options
 * {
 *  noWrap: bool, replace whitespace with non-breaking whitespace
 * }
 * @returns The String To Convert
 */
export const titleize = function (string: string, { noWrap }: TitleizeOptions = {}): string {
  let title = string.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );

  if (noWrap) {
    title = nonBreakingText(title);
  }

  return title;
}

function nonBreakingText(string: string): string {
  return string.replace(/\s/g, '\xa0');
}
