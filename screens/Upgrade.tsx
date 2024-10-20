import React from 'react';
import { View, Text } from 'react-native';
import { useCurrentUser } from '../redux/hooks';
import { MyAvatar } from '../src/components/MyAvatar';
import { Colors } from '../styles/colors';

export const UpgradeScreen = (): JSX.Element => {
  const currentUser = useCurrentUser();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.darkCyan }}>
      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 90 }}>
        <MyAvatar photoUrl={currentUser.nowPhoto?.display?.url || currentUser.thenPhoto?.display?.url || ''} />
        <Text style={{ color: Colors.whiteRGBA(), fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 }}>{'Looking to upgrade\nyour account?'}</Text>
        <Text style={{ color: Colors.whiteRGBA(), fontSize: 18, textAlign: 'center', marginVertical: 10 }}>{'Please go to Classmates.com on the\nweb to manage your account.'}</Text>
      </View>
    </View>
  )
}
