import React from 'react'
import { StyleProp, StyleSheet, TextStyle } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { HeaderBackButtonProps } from '@react-navigation/elements'

export enum IconFamily {
  FontAwesome = 'FontAwesome',
  AntDesign = 'AntDesign'
}

type Props = HeaderBackButtonProps & {
  iconName?: string
  iconFamily?: IconFamily
  iconSize?: number
  color?: string
  iconStyle?: StyleProp<TextStyle>
  /**
   * If shouldUseCustomOnPress is required to be set as true when you passing manually the attribute onPress.
   * Defaulted to false for ignoring default onPress event coming from the stack HeaderBackButtonProps
   */
  shouldUseCustomOnPress?: boolean
}

export const BackButton = ({
  iconName = 'angle-left',
  iconFamily = IconFamily.FontAwesome,
  iconSize = 40,
  color = undefined,
  iconStyle,
  onPress,
  shouldUseCustomOnPress = false
}: Props): JSX.Element => {

  const navigation = useNavigation();

  const _renderIcon = () => {
    switch (iconFamily) {
      case IconFamily.AntDesign:
        return (
          <AntDesign name={iconName}
            size={iconSize}
            style={[styles.iconStyle, iconStyle]}
            color={color}
          />
        )

      default:
        return (
          <Icon name={iconName}
            size={iconSize}
            style={[styles.iconStyle, iconStyle]}
            color={color}
          />
        )
    }
  }

  return (
    <TouchableOpacity
      onPress={() => {
        if (shouldUseCustomOnPress && onPress) {
          return onPress()
        }
        return navigation.canGoBack() ? navigation.goBack() : null
      }}
    >
      {_renderIcon()}
    </TouchableOpacity>
  )


}

const styles = StyleSheet.create({
  iconStyle: {
    paddingHorizontal: 24
  }
})
