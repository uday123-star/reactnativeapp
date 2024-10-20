import * as React from 'react';
import { Text, View } from 'react-native';
import { globalStyles } from '../styles/global-stylesheet';

export const MenuScreen = (): JSX.Element => {
  return (
    <View style={globalStyles.container}>
      <Text>menu</Text>
    </View>
  );
}
