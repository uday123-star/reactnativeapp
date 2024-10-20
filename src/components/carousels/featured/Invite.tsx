import React from 'react';
import { Card } from 'react-native-elements';
import { Button } from '../../Button';
import { StyleProp, View, ViewStyle, Text, Share } from 'react-native';
import { isAndroid } from '../../../helpers/device';
import SmileyFaces from '../../../../assets/images/three_smileyfaces.svg'

interface Props {
  contentCardContainerStyles?: StyleProp<ViewStyle>
}

export const FeaturedCarouselInvite = ({ contentCardContainerStyles }: Props): JSX.Element => {
  return (
    <Card containerStyle={contentCardContainerStyles}>
      <View style={{
        alignItems: 'center'
      }}
      >
        <SmileyFaces style={{
          maxWidth: '50%',
          marginTop: 10,
        }}
        />
        <Text style={{ fontSize: 22, textAlign: 'center', padding: 10 }}>
          Invite your old schoolmates to join in on the fun!
        </Text>
        <Button
          title={'INVITE SCHOOLMATES'}
          style={{ marginTop: 10 }}
          accessibilityLabel='invite schoolmates'
          onPress={() => Share.share({
            message: `Reconnect with friends from high school, view yearbook photos and more.\nJoin Classmates®!${isAndroid() ? '\nhttps://www.classmates.com/' : ''}`,
            url: 'https://www.classmates.com/',
            title: 'Invite friends',
          }, {
            dialogTitle: 'Invite friends',
            subject: 'Classmates Invitation',
            // tintColor: '#f46f13',
          })}
          accessible={true} 
        />
      </View>
    </Card>
  );
}

