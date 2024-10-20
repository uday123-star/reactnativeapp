import * as React from 'react'
import { View } from 'react-native'
import { Placeholder, Fade, PlaceholderMedia, PlaceholderLine } from 'rn-placeholder'

export const ConversationPlaceholder = () => {
return (
  <Placeholder
    style={{ marginVertical: 15, backgroundColor: 'white', padding: 20, borderRadius: 10 }}
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
