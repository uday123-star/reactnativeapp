import * as React from 'react'
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native'
import { Author, School } from '../../../data/queries/conversations/types'
import { getClassTitle } from '../../../redux/slices/current-affiliation/helpers'
import { StudentModel } from '../../../types/interfaces'
import { useGoToConversationProfile } from '../../hooks/useGoToConversationProfile'
import { Text } from '../Text'
import { UserAvatar } from '../UserAvatar'

interface Props {
  user: Author
  school: School
  containerStyles?: StyleProp<ViewStyle>
}

export const UserBlock = ({ user, school, containerStyles }: Props) => {
  const { name, photo, registration_id, affiliation } = user;
  const fullName = name.split(' ');
  const firstName = affiliation ? affiliation.firstName : fullName[0];
  const lastName = affiliation ? affiliation.lastName : (fullName.length > 1 ? fullName[1] : '');
  const authorData = {
    personId: registration_id,
    firstName,
    lastName,
    nowPhoto: {
      display: {
        url: photo,
        height: '0',
        width: '0'
      },
      thumbnail: {
        url: photo,
        height: '0',
        width: '0'
      },
    }
  };

  const goToConversationProfile = useGoToConversationProfile(registration_id)

  const classTitle = affiliation ?
    getClassTitle(
      affiliation.gradYear || affiliation.endYear,
      affiliation.role === 'STUDENT',
      affiliation.startYear
    ) :
    getClassTitle(String(school.year));

  return (
    <View style={[{ flexDirection: 'row', margin: 20, width: '100%' }, containerStyles]}>
      <View style={[styles.postedByAvatar, { overflow: 'hidden' }]}>
        <UserAvatar
          user={authorData as StudentModel}
          avatarSize={65}
          onPress={() => goToConversationProfile(registration_id)}
        />
      </View>
      <View style={{ flexShrink: 1 }}>
        <View style={{ flexDirection: 'column', paddingLeft: 10, paddingRight: 20 }}>
          <Pressable onPress={() => goToConversationProfile(registration_id)}>
            <Text
              isBold
              numberOfLines={1}
            >{user.name}</Text>
          </Pressable>
          <Text numberOfLines={1} style={{ marginTop: 2, paddingRight: 20 }}>{school.name}</Text>
          <Text numberOfLines={1} style={{ marginTop: 2 }}>{classTitle}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  postedByAvatar: {
    height: 65,
    width: 65,
    borderRadius: 50,
  }
})
