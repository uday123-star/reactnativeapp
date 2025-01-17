export const Colors = {
  darkCyan: '#009999',
  cyan: '#009bd4',
  ligthCyan: '#BDE1E2',
  ligthGray: '#d8d9e0',
  gray: '#E5E5E5',
  mediumGray: '#ccc',
  darkGray: '#7D7E7F',
  textInputGray: '#F3F3F3',
  disabledBackground: '#e6e6e6',
  disabledText: '#a6a6a6',
  backgroundGray: '#f9f9f9',
  commentBackground: '#F0F8F9',
  focusedComment: '#CDE9EA',
  green: '#4CAF50',
  red: '#D11A2A',
  orange: '#FF5C00',
  purple: '#4E2B58',
  mention: '#4a85bb',
  whiteLevel: (level:0|1|2|3|4|5|6|7|8|9) => `#f${level}f${level}f${level}`,
  whiteRGBA: (opacity?: number) => opacity ? `rgba(255, 255, 255, ${opacity})` : 'white',
  blackRGBA: (opacity?: number) => opacity ? `rgba(0, 0, 0, ${opacity})` : 'black',

  // userListItem and weeble background colors
  teal1: '#009999',
  teal2: '#88C2CA',
  orange1: '#F7941E',
  orange2: '#F46F13',
  purple1: '#58456E',
  purple2: '#A193B1',
  grayTop: '#D8D8D8',
  grayBottom: '#efeeee'
}
