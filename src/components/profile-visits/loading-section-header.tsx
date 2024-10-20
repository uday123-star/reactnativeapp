import * as React from 'react'
import { View } from 'react-native'
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder'
import { ScreenWidth } from '@freakycoder/react-native-helpers'

export const LoadingSectionHeader = (): JSX.Element => {
  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', width: ScreenWidth * 0.85 }}>
          <Placeholder Animation={Fade}><PlaceholderLine /></Placeholder>
        </View>
      </View>
    </View>
  )
}
