import React from 'react'
import { View } from 'react-native'
import { Text } from '../Text'
import Icon from 'react-native-vector-icons/FontAwesome'
import { globalStyles } from '../../../styles/global-stylesheet'
import { AddPhotoButton } from '../AddPhotoButton'

interface Props {
  onPress: () => void
  useGrowContainer?: boolean
}

export const EmptyAlbum = ({
  onPress,
  useGrowContainer = false
}: Props): JSX.Element => {
  return (
    <View style={[{ backgroundColor: '#FEF4D9', alignItems: 'center' }, useGrowContainer ? globalStyles.growContainer : undefined]}>
      <Icon.Button name="camera"
        size={38}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: 20 }}
      />
      <Text style={{ fontSize: 22 }}>Be the first to add a photo</Text>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>for the class to see!</Text>
      <AddPhotoButton
        containerStyle={{ ...globalStyles.butonContainerPartialWidth, marginBottom: 20 }}
        onPress={onPress}
      />
    </View>
  )
}

