import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { Pressable, View } from 'react-native'
import { useCurrentUser } from '../../../redux/hooks'
import { Colors } from '../../../styles/colors'
import { ConversationFeedVariables } from '../../../types/interfaces'
import { ConversationsStackParamList } from '../../../types/types'
import { TitleBar } from '../conversations/TitleBar'
import { Text } from '../Text'
import { UserAvatar } from '../UserAvatar'
import { ConversationPlaceholder } from './Placeholder'

interface Props {
  feedVariables: ConversationFeedVariables
}

export const ConversationFeedLoader = ({ feedVariables }: Props) => {
  const currentUser = useCurrentUser();
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  return (
    <View>
      <View>
        <TitleBar />
        <View
          style={{
            padding: 20,
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text
              fontSizePreset={2}
              isBold
              isCentered
              style={{ textTransform: 'uppercase' }}
            >
              Start a new conversation with your class
            </Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              <UserAvatar
                user={currentUser}
                avatarSize={50}
                onPress={() => false}
              />
              <Pressable
                onPress={() => navigation.navigate('_createConversation', { feedVariables })}
                style={{ flex: 1, marginRight: 20 }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: Colors.whiteRGBA(),
                    borderRadius: 25,
                    height: 43,
                    marginLeft: 20,
                    paddingHorizontal: 20,
                    width: '100%'
                  }}
                >
                  <Text style={{ fontSize: 18 }}>What&apos;s on your mind?</Text>
                </View>
              </Pressable>
            </View>
          </View>
          <ConversationPlaceholder />
        </View>
      </View>
    </View>
  )
}
