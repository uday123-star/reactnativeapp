import { RumActionType } from '@datadog/mobile-react-native';
import * as React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native';
import { Button } from './Button';
import { globalStyles } from '../../styles/global-stylesheet';
import { dataDogStartAction } from '../helpers/datadog';
import { useConfiguration } from '../hooks';

interface Props {
  containerStyle?: StyleProp<ViewStyle>
  onPress: () => void
}

export const AddPhotoButton = ({ onPress, containerStyle = {}}: Props) => {

  const { features: { isPhotoUploadEnabled }} = useConfiguration();

  const _onPress = () => {
    dataDogStartAction(RumActionType.TAP, 'add photo button');
    onPress()
  }

  return (
    <View>
      {Boolean(isPhotoUploadEnabled) && (
        <Button
          accessibilityLabel="Add a photo"
          accessible={true}
          title="ADD A PHOTO"
          style={containerStyle ? containerStyle : globalStyles.buttonStyle}
          onPress={_onPress}
        />
      )}
    </View>
  )
}

