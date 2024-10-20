import * as React from 'react'
import { View } from 'react-native'
import { Placeholder, Fade, PlaceholderMedia, PlaceholderLine } from 'rn-placeholder'

interface Props {
  repeats?: number
}

export const LoadingListItem = ({ repeats = 1 }: Props): JSX.Element => {

  const loop = [...Array(repeats).keys()]

  return (
    <View>
      {loop.map((i) =>
        {
          return (
            <View key={i} style={{ paddingVertical: 10 }}>
              <Placeholder
                Animation={Fade}
                Left={PlaceholderMedia}
              >
                <PlaceholderLine />
                <PlaceholderLine />
              </Placeholder>
            </View>
          )
        })}
    </View>
  )
}
