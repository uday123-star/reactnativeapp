import * as React from 'react'
import { TouchableHighlight, View, Text } from 'react-native'

interface Props {
  index: number
  size: number | undefined
  margin: number | undefined
  onPress(): void
}

export const ViewAll = ({ size, margin, onPress }: Props) => {
  return (
    <TouchableHighlight
      style={{
        position: 'relative',
        width: size,
        height: size,
        marginRight: margin,
        marginBottom: 10
      }}
      onPress={onPress}
      accessible={true}
      accessibilityLabel='View all photos'
      accessibilityRole='button'
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent:
            'center',
          alignItems: 'center',
          width: size,
          height: size,
          backgroundColor: '#BDE1E2'
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>VIEW{'\n'}ALL</Text>
      </View>
    </TouchableHighlight>
  )
}
