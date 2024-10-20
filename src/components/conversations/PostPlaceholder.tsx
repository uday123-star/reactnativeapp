import * as React from 'react'
import { View } from 'react-native'
import { Placeholder, PlaceholderLine, PlaceholderMedia, Fade } from 'rn-placeholder'

export const ConversationPostPlaceholder = () => {

  return (
    <Placeholder
      style={{ padding: 20 }}
      Animation={Fade}
    >
      <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 15 }}>
        <View style={{ flexDirection: 'row' }}>
          <PlaceholderMedia />
          <View style={{ flexGrow: 1, paddingHorizontal: 15 }}>
            <PlaceholderLine width={50} />
            <PlaceholderLine width={50} />
            <PlaceholderLine width={50} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center' }}>
          <PlaceholderLine width={30} />
          <View style={{ flexGrow: 1, alignItems: 'flex-start', paddingLeft: 15 }}>
            <PlaceholderLine />
          </View>
        </View>
        <PlaceholderLine />
        <PlaceholderLine />
        <PlaceholderLine />
        <PlaceholderLine width={75} />
      </View>
      <View style={{ flexDirection: 'row', paddingVertical: 15, alignItems: 'center' }}>
        <PlaceholderMedia />
        <View style={{ flexGrow: 1, alignItems: 'flex-start', paddingLeft: 15 }}>
          <PlaceholderLine />
        </View>
      </View>
    </Placeholder>
  )
}
