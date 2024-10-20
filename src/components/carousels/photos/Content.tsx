import React from 'react';
import { View, ImageBackground, TouchableHighlight } from 'react-native';
import { colors } from 'react-native-elements';
import { Photo } from '../../../../types/interfaces';

export interface CallToAction {
  id: string
  callToAction: (index: number, size: number, margin: number) => JSX.Element
}

interface ContentProps {
  photo: Photo | CallToAction
  size: number
  index: number
  margin?: number
  onPress?: (photoId:string, index: number, photo: Photo) => void
}

export const Content = ({ photo, size, index, margin, onPress }: ContentProps): JSX.Element => {
  if (('callToAction' in photo)) {
    return photo.callToAction(index, size, margin || 0)
  }
  return (
    <TouchableHighlight
      style={{
        width: size,
        height: size,
        marginBottom: margin,
        marginRight: margin
      }}
      onPress={() => onPress ? onPress(photo.id, index, photo) : null}
      accessible={true}
      accessibilityLabel='Open Carousel Photo'
      accessibilityRole='imagebutton'
    >
      <View style={{
        width: size,
        height: size,
        borderColor: colors.grey5,
        borderWidth: 1,
      }}
      
      >
        <ImageBackground
          source={{
            uri: photo?.display?.url
          }}
          resizeMode="cover"
          resizeMethod='resize'
          style={{
            width: size - 2,
            height: size - 2,
          }}
          accessible={true}
          accessibilityLabel='Carousel Photo'
          accessibilityRole='image'
        />
      </View>
    </TouchableHighlight>
  )
}
