import * as React from 'react'
import { Text as BaseText, TextProps } from 'react-native'
import { Colors } from '../../styles/colors'

interface Props extends TextProps {
  fontSizePreset?: number
  isBold?: boolean
  isCentered?: boolean
  textWhite?: boolean
}

/**
 * @param fontSizePreset as a property, uses a predefined font size.
 * Works like headings in html. 1 is biggest, 6 is smallest.
 */

const fontSizeMap = new Map([
  [0, 16],
  [1, 30],
  [2, 24],
]);
export class Text extends React.Component<Props> {
  render() {
    const {
      children,
      style,
      fontSizePreset = 0,
      isBold = false,
      isCentered = false,
      textWhite = false,
      ...rest
    } = this.props
    const fontSize = fontSizeMap.has(fontSizePreset) ? fontSizeMap.get(fontSizePreset) : fontSizeMap.get(0);
    const fontWeight = isBold ? 'bold' : 'normal';
    const textAlign = isCentered ? 'center' : 'auto';
    const color = textWhite ? Colors.whiteRGBA() : undefined;

    return (
      <BaseText
        allowFontScaling={false}
        style={[{ fontSize, fontWeight, textAlign, color }, style]}
        {...rest}
      >
        {children}
      </BaseText>
    )
  }
}
