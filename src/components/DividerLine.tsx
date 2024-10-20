import React from 'react';
import { View } from 'react-native';

export const DividerLine = (): JSX.Element => {
  return (
    <View
      style={{
        borderBottomColor: 'silver',
        borderBottomWidth: 2,
        marginBottom: 25,
        marginTop: 20
      }}
    />
  );
}
