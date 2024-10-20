import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { IconFamily } from './BackButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { HeaderBackButtonProps } from '@react-navigation/elements'

type Props = HeaderBackButtonProps & {
  iconName?: string
  iconFamily?: IconFamily
  iconSize?: number
  color?: string
  iconStyle?: StyleProp<TextStyle>
}

export const ForwardButton = ({
  iconName = 'angle-right',
  iconFamily = IconFamily.FontAwesome,
  iconSize = 40,
  color = undefined,
  iconStyle,
  onPress
}: Props): JSX.Element => {

  const _renderIcon = () => {
    switch (iconFamily) {
      case IconFamily.AntDesign:
        return (
          <AntDesign name={iconName}
            size={iconSize}
            style={iconStyle}
            color={color}
          />
        )

      default:
        return (
          <Icon name={iconName}
            size={iconSize}
            style={[iconStyle]}
            color={color}
          />
        )
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
    >
      {_renderIcon()}
    </TouchableOpacity>
  )
}
