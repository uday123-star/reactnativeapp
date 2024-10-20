import * as React from 'react'
import { View, ImageBackground } from 'react-native'

export const AppLoadingScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#009bd3' }}>
      <ImageBackground source={require('../assets/images/adaptive-icon.png')}
        resizeMode='contain'
        style={{ flex: 1 }}
      />
    </View>
  )
}
