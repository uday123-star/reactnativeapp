import React from 'react';
import { Card } from 'react-native-elements';
import { StyleProp, View, ViewStyle, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  contentCardContainerStyles?: StyleProp<ViewStyle>
}

export const FeaturedCarouselError = ({ contentCardContainerStyles }: Props): JSX.Element => {
  return (
    <Card containerStyle={contentCardContainerStyles}>
      <View style={{ height: 190, backgroundColor: '#BDE1E2' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
        </View>
        <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 10 }}>
          Oops
        </Text>

        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Icon.Button name="exclamation-circle"
            size={80}
            color={'red'}
            backgroundColor={'transparent'}
            onPress={() => alert('invite frieds')}
          />
        </View>

        <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 10 }}>
          Please try again
        </Text>
      </View>
    </Card>
  );
}

