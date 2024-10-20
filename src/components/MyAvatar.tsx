import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-elements';
import ConditionalWrapper from './helpers/ConditionalWrapper';

interface Props {
  namePlate?: string
  photoUrl?: string|null
  onPress?: () => void
  placeHolder?: JSX.Element
}

export const MyAvatar = ({ photoUrl = '', namePlate = '', onPress, placeHolder }: Props): JSX.Element => {
  let avatar;

  if (photoUrl) {
    avatar = { uri: photoUrl };
  } else {
    avatar = require('../../assets/images/photos/image-placeholder.png');
  }

  return (
    <ConditionalWrapper
      condition={!!onPress}
      wrapper={children => <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>}
    >
      <View
        style={{ height: 77, width: 77, borderRadius: 50, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{ height: 75, width: 75, borderRadius: 50, backgroundColor: 'black', overflow: 'hidden' }}
          accessible={true}
          accessibilityLabel={namePlate ? `${namePlate} PHOTO` : 'PROFILE PHOTO'}
          accessibilityRole='image'
        >
          <Avatar
            rounded
            containerStyle={styles.avatar}
            size="large"
            source={avatar}
          />
          {!!namePlate &&
            <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', position: 'relative', bottom: 23, paddingBottom: 7, paddingTop: 2 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>{namePlate}</Text>
            </View>
          }
          {
            (!photoUrl?.length && placeHolder) && placeHolder
          }
        </View>
      </View>
    </ConditionalWrapper>
  )
}

const styles = StyleSheet.create({
  avatar: {
    marginTop: 0,
    alignSelf: 'center',
    borderWidth: 0
  },
});
