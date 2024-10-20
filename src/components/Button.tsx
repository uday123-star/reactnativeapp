import React, { StyleSheet, View, TouchableOpacity } from 'react-native'
import { StyleProps } from 'react-native-reanimated'
import { Text } from './Text'
import { globalStyles } from '../../styles/global-stylesheet'
import { Colors } from '../../styles/colors'

interface Props {
  title?: string
  onPress: () => void
  accessibilityLabel: string
  accessible: boolean
  backgroundColor?: string
  textColor?: string
  borderRadius?: number
  style?: StyleProps
  children?: JSX.Element
  isPartialWidth?: boolean
  disabled?: boolean
  fontSize?: number
}

const { cyan, whiteRGBA } = Colors

export const Button = ({ title, onPress, accessibilityLabel, accessible, backgroundColor = cyan, textColor = whiteRGBA(), borderRadius = 25, style, isPartialWidth = false, children, disabled = false, fontSize = 18 }: Props) => {
  let buttonWidth = globalStyles.butonContainerFullWidth;
  let buttonStyles: StyleProps = globalStyles.buttonStyle;
  
  if (isPartialWidth) {
    buttonWidth = globalStyles.butonContainerPartialWidth
  }

  if (style) {
    buttonStyles = {
      ...buttonStyles,
      ...style
    }
  }

  if (disabled) {
    backgroundColor = Colors.disabledBackground,
    textColor = Colors.disabledText
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessible={accessible}
      accessibilityRole='button'
      style={[buttonWidth, buttonStyles, { backgroundColor, borderRadius }]}
      disabled={disabled}
    >
      <View>
        {
        children ? children : <Text style={[styles.title, { color: textColor, fontSize }]}>{title}</Text>
        } 
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: Colors.backgroundGray
  }
})
