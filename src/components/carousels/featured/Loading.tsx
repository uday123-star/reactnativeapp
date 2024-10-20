import React from 'react';
import { Card } from 'react-native-elements';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

interface Props {
  contentCardContainerStyles?: StyleProp<ViewStyle>
}

export const LoadingContent = ({ contentCardContainerStyles }: Props): JSX.Element => {
  return (
    <Card containerStyle={contentCardContainerStyles}>
      <Placeholder
        Animation={Fade}
      >
        <View style={{ height: 160, borderWidth: 3, borderColor: '#EEE' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
            <View style={{ marginVertical: 15 }}>
              <PlaceholderMedia />
            </View>
            <PlaceholderLine width={50} />
            <PlaceholderLine width={50} />
          </View>
        </View>
      </Placeholder>
      <Placeholder Animation={Fade}>
        <View style={{ flex: 1, flexDirection: 'row', height: 50, marginTop: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <PlaceholderLine width={60} />
          </View>
          <PlaceholderLine width={25} />
        </View>
      </Placeholder>
      <Placeholder
        Animation={Fade}
      >
        <PlaceholderLine width={100}
          height={25}
          style={{ margin: 0, padding: 0 }}
        />
      </Placeholder>
    </Card>
  );
}

