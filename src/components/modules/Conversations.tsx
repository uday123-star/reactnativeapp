import { DrawerActions, useIsFocused, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { Card } from 'react-native-elements'
import { Button } from '../Button'
import Icon from 'react-native-vector-icons/Ionicons'
import { ConversationsActivityResponse, GET_CONVERSATIONS_ACTIVITY, NotificationAction, NotificationPostingType, NotificationRecord } from '../../../data/queries/conversations/activity'
import { useCurrentAffiliation, useCurrentUserId } from '../../../redux/hooks'
import { mockStudent } from '../../../redux/slices/current-affiliation/helpers'
import { conversationParams, RootStackParamList } from '../../../types/types'
import { Text } from '../Text'
import { UserAvatar } from '../UserAvatar'
import { BaseModule } from './Base'
import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder'
import { useQuery } from '@apollo/client'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { timeAgo } from '../../helpers/conversations'
import { getSessionData } from '../../helpers/session'
import { useAffiliationYearRange } from '../../hooks'

export const ConversationsModule = () => {
  const navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> = useNavigation();
  const currentAffiliation = useCurrentAffiliation();
  const { range: yearRange, end: endYear, isStudent } = useAffiliationYearRange();
  const currentUserId = useCurrentUserId();
  const focused = useIsFocused();

  const { schoolId } = currentAffiliation;
  const variables = {
    authorId: currentUserId,
    ...(isStudent ?
      { gradYear: Number(endYear) } :
      { yearRange }
    ),
    schoolId,
    limit: 4
  };

  const { data, loading, startPolling, stopPolling } = useQuery<ConversationsActivityResponse>(GET_CONVERSATIONS_ACTIVITY, {
    variables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    onError: (error) => {
      const session = getSessionData();
      DdRum.addError('Loading Activity Module', ErrorSource.SOURCE, error.message || 'Error fetching conversations activity', {
        variables,
        session
      }, Date.now())
    },
  });

  useEffect(() => {
    return () => {
      stopPolling();
    }
  }, []);

  useEffect(() => {
    if (focused) {
      startPolling(120000);
    } else {
      stopPolling();
    }
  }, [focused]);

  const navigateToConversations = () => {
    navigation.dispatch(DrawerActions.jumpTo('Conversations'))
  }

  const _openConversation = (conversation_id: string, id: string, type: NotificationPostingType, comment_id?: string) => {
    let post_type: 'comment' | 'reply' = 'comment'
    let params: conversationParams = {
      id: conversation_id,
      newContent: {
        id,
        type: post_type,
      }
    }

    if (type === 'REPLY') {
      post_type = 'reply'
      params = {
        id: conversation_id,
        newContent: {
          id,
          type: post_type,
          comment_id,
        }
      }
    }

    navigation.navigate('Conversations', {
      screen: '_conversation',
      params: params
    });
  }

  const _getInteractionContent = (item: NotificationRecord) => {
    const {
      actor: {
        name,
      },
      action,
      parent_posted_by: {
        registration_id: authorId,
        name: authorName
      },
      posting_type,
      creation_date
    } = item;

    const _authorText = () => {
      return authorId === currentUserId ?
        (<Text>your</Text>) :
        (<Text
          style={{
            fontWeight: 'bold',
          }}
        >&nbsp;{authorName}</Text>)
    }

    return (<View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>
      <Text numberOfLines={2}>
        <Text
          style={{ textAlign: 'left' }}
          isBold
        >{name}&nbsp;</Text>
        {
          action === NotificationAction.REACTED && <Text>
            reacted to&nbsp;
            {_authorText()}
            {
              posting_type === NotificationPostingType.CONVERSATION && ' conversation'
            }
            {
              posting_type === NotificationPostingType.COMMENT && ' comment'
            }
            {
              posting_type === NotificationPostingType.REPLY && ' reply'
            }
          </Text>
        }
        {
          action === NotificationAction.POSTED && <Text>
            {
              posting_type === NotificationPostingType.CONVERSATION && 'started a new conversation'
            }
            {
              posting_type === NotificationPostingType.COMMENT && <Text>
                commented on&nbsp;
                {_authorText()}
                &nbsp;conversation.
              </Text>
            }
            {
              posting_type === NotificationPostingType.REPLY && <Text>
                replied to&nbsp;
                {_authorText()}
                &nbsp;comment.
              </Text>
            }
          </Text>
        }
      </Text>
      <Text isBold>{timeAgo(creation_date)}</Text>
    </View>)
  }

  const getPlaceHolder = () => {
    return (<View>
      <View style={{ flex: 1, flexDirection: 'row', marginVertical: 10 }}>
        <PlaceholderMedia size={75} />
        <View style={{
            flex: 1,
            flexDirection: 'column',
            paddingLeft: 10,
            justifyContent: 'center'
          }}
        >
          <PlaceholderLine height={16} noMargin={true} />
          <PlaceholderLine
            height={16}
            width={40}
            noMargin={true}
            style={{
              marginTop: 5
            }}
          />
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', marginVertical: 10 }}>
        <PlaceholderMedia size={75} />
        <View style={{
            flex: 1,
            flexDirection: 'column',
            paddingLeft: 10,
            justifyContent: 'center'
          }}
        >
          <PlaceholderLine height={16} noMargin={true} />
          <PlaceholderLine
            height={16}
            width={40}
            noMargin={true}
            style={{
              marginTop: 5
            }}
          />
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', marginVertical: 10 }}>
        <PlaceholderMedia size={75} />
        <View style={{
            flex: 1,
            flexDirection: 'column',
            paddingLeft: 10,
            justifyContent: 'center'
          }}
        >
          <PlaceholderLine height={16} noMargin={true} />
          <PlaceholderLine
            height={16}
            width={40}
            noMargin={true}
            style={{
              marginTop: 5
            }}
          />
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', marginVertical: 10 }}>
        <PlaceholderMedia size={75} />
        <View style={{
            flex: 1,
            flexDirection: 'column',
            paddingLeft: 10,
            justifyContent: 'center'
          }}
        >
          <PlaceholderLine height={16} noMargin={true} />
          <PlaceholderLine
            height={16}
            width={40}
            noMargin={true}
            style={{
              marginTop: 5
            }}
          />
        </View>
      </View>
    </View>)
  }
  return (
    <BaseModule
      icon={<Icon.Button name='chatbubbles'
        size={28}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: -7, marginRight: 0 }}
      />}
      heading="Conversations"
    >
      <Card>
        <Card.Title style={{ textAlign: 'left', marginBottom: 0 }}>New Conversations</Card.Title>
        <View style={{ marginTop: 10 }}>
          {Boolean(data?.conversationsSiteNotifications.length && !loading) && data?.conversationsSiteNotifications.map((item, id) => {
            const { name, registration_id } = item.actor;
            const fullName = name.split(' ');
            const firstName = fullName[0];
            const lastName = fullName.length > 2 ? fullName[2] : fullName.length > 1 ? fullName[1] : '';
            return (
              <Pressable key={id} onPress={() => _openConversation(item.conversation_id, item.posting_id, item.posting_type, item.comment_id)}>
                <View style={{ flex: 1, flexDirection: 'row', marginVertical: 10 }}>
                  <UserAvatar
                    user={mockStudent({ firstName, lastName, id: registration_id, personId: registration_id })}
                    strict={false}
                    onPress={() => _openConversation(item.conversation_id, item.posting_id, item.posting_type, item.comment_id)}
                  />

                  {/* must wrap text in a flex container to make text wrap in a flexbox.  */}
                  {_getInteractionContent(item)}
                </View>
              </Pressable>
            )
          })}
          {
            Boolean(!(data?.conversationsSiteNotifications.length) && !loading) && <Text
              style={{
                fontSize: 22,
                paddingVertical: 20,
                textAlign: 'center'
              }}
            >It&apos;s pretty quiet in here. Why not start you own conversation?</Text>
          }
          {
            Boolean(loading) && getPlaceHolder()
          }
        </View>
        <Button
          title="SEE ALL CONVERSATIONS"
          style={{ marginTop: 10 }}
          onPress={navigateToConversations}
          accessibilityLabel='all conversations'
          accessible={true} 
        />
      </Card>
    </BaseModule>
  )
}
