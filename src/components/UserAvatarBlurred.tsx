import * as React from 'react';
import { Image, View } from 'react-native';
import { Weeble } from './Weeble';

interface Props {
  personId: string
  photoUrl: string
  useBlur: boolean
}

export const UserAvatarBlurred = ({ personId, photoUrl, useBlur }: Props): JSX.Element => {

  // always prefer the photoUrl
  if (photoUrl) {
    const blurRadius = useBlur ? 12 : 0;
    return (
      <View>
        <Image
          style={{ width: 68, height: 68, borderRadius: 40 }}
          source={{ uri: photoUrl }}
          blurRadius={blurRadius}
        />
      </View>
    )
  } else {

    // If no photoUrl or personId is supplied,
    // guess a random number. This prevents the weeble
    // from crashing.
    const id = personId || Math.floor(Math.random() * 1000);
    return <Weeble id={String(id)} />
  }
}
