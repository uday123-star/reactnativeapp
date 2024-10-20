import * as React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Colors } from '../../../styles/colors'

/**
 * This Loader should be used at the screen level. Individual
 * loading states should be handled by the Placeholder component.
 * @returns
 */
export const ScreenLoadingIndicator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator
        color={Colors.cyan}
        style={{
          width: 40,
          height: 40
        }}
      />
    </View>
  )
}
