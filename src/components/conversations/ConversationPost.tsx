import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '../Text'
import { Colors } from '../../../styles/colors'
import { UserBlock } from './UserBlock'
import { useNavigation, useRoute } from '@react-navigation/native'
import { CommentList } from './CommentList'
import { timeAgo } from '../../helpers/conversations'
import { Conversation, Comment, Reply } from '../../../data/queries/conversations/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { ConversationsStackParamList, NewContentInfo } from '../../../types/types'
import { ConversationFeedVariables } from '../../../types/interfaces'
import { ReactionSection } from './ReactionsSection'
import { useApolloClient, useMutation } from '@apollo/client'
import { DeleteConversationResponse, DELETE_POST } from '../../../data/queries/conversations/delete_conversation'
import BasicAlert from '../BasicAlert'
import { ConversationPostPlaceholder } from './PostPlaceholder'
import { ContentActionsMenu } from './ContentActionsMenu'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { ConversationReports } from './ConversationReports'
import { ReportConversationResponse, REPORT_CONVERSATION } from '../../../data/queries/security/report_conversations'
import { MentionsText } from './mentions'
import { getSessionData } from '../../helpers/session'

interface Props {
  conversation: Conversation
  showFirstCommentOnly?: boolean
  isCommentPaginationEnabled?: boolean
  isReplyPaginationEnabled?: boolean
  feedVariables: ConversationFeedVariables
  shouldFocusComments?: boolean
  focusedCommentId?: string
  onPress?: (id: string) => void
  focusContent?: (item: Conversation | Comment | Reply, ref: View) => void
  newContent?: NewContentInfo
}

export const ConversationPost = ({
  conversation,
  showFirstCommentOnly = false,
  isCommentPaginationEnabled = false,
  isReplyPaginationEnabled = false,
  feedVariables,
  shouldFocusComments = false,
  focusedCommentId,
  onPress,
  focusContent,
  newContent,
}: Props) => {
  const { posted_by, school, creation_date, message, highlighted } = conversation
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();

  const route = useRoute();

  const [shouldShowComments, setShouldShowComments] = useState(true)
  const [isLoading, setIsLoading] = useState(false);

  const [ deleteConversation ] = useMutation<DeleteConversationResponse>(DELETE_POST);
  const [ reportConversation ] = useMutation<ReportConversationResponse>(REPORT_CONVERSATION);
  const client = useApolloClient();

  const _deletePost = () => {
    const sessionData = getSessionData();
    setIsLoading(true);
    deleteConversation({
      variables: {
        id: conversation.id
      },
      fetchPolicy: 'no-cache',
      update: (cache, { data }) => {
        if (data) {
          const { deleteConversation: { id }} = data;
          const cachedId = cache.identify({
            __typename: 'Conversation',
            id
          });
          cache.modify({
            id: cachedId,
            fields: (convo, { DELETE }) => {
              return DELETE;
            }
          });
        }
      },
      onError: (error) => {
        DdRum.addError('Delete Conversation', ErrorSource.CUSTOM, error.message || 'Error deleting conversation', {
          session: sessionData,
          content: conversation
        }, Date.now());
        setIsLoading(false);
        BasicAlert.show({
          title: 'Conversations',
          text: 'Oops! There was an error trying to delete you conversation, try again later.'
        })
      },
      onCompleted: (data) => {
        DdRum.addAction(RumActionType.CUSTOM, 'Delete Conversation', {
          session: sessionData,
          content: data?.deleteConversation
        }, Date.now());
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    });
  }

  const _onReport = () => {
    BasicAlert.show({
      title: 'Report Content',
      text: (<ConversationReports onOpenTOS={(section) => {
          BasicAlert.hide();
          navigation.navigate('_tos', { section })
        }}
      />),
      acceptText: 'CONFIRM',
      onAccept: () => {
        reportConversation({
          variables: {
            id: conversation.id
          },
          onCompleted: () => {
            BasicAlert.show({
              title: 'Feedback',
              text: (<ConversationReports
                isSuccessMessage={true}
                onOpenTOS={(section) => {
                  BasicAlert.hide();
                  navigation.navigate('_tos', { section })
                }}
                onOpenHelp={(ticket_form_id) => {
                  BasicAlert.hide();
                  navigation.navigate('_help', { ticket_form_id })
                }}
              />),
            })
          },
          onError: () => {
            BasicAlert.show({
              title: 'Report Content',
              text: 'Oops! There was an error trying to send your report, try again later.'
            })
          }
        })
      }
    })
  }

  const onToggleComments = () => {
    if (route.name === '_feed') {
      navigation.navigate('_conversation', {
        id: conversation.id,
        shouldFocusComments: true
      })
    } else {
      setShouldShowComments(prev => !prev)
    }
  }
  const onOpenConversation = (id: string) => {
    if (onPress && highlighted) {
      if (conversation.highlighted) {
            const cache = client.cache;
            const cachedId = cache.identify({
              __typename: 'Conversation',
              id: conversation.id,
            });
            client.cache.modify({
              id: cachedId,
              fields: {
                highlighted: () => false,
              }
            });
          }
        onPress(id)
    } else if (onPress) {
      onPress(id)
    }
  }

  if (isLoading) {
    return (<ConversationPostPlaceholder />)
  }

  return (
    <View style={{ flex: 1, backgroundColor: highlighted ? Colors.focusedComment : Colors.whiteRGBA(), borderRadius: 10, marginBottom: 20, marginHorizontal: 20 }}>
      <ContentActionsMenu
        content={conversation}
        onDelete={_deletePost}
        onEdit={() => {
          const mention = conversation.message.find((m) => m.entityRanges.find((e) => e.entity.type === 'mention'));
          if (mention) {
            BasicAlert.show({
              title: 'Conversation',
              text: (<Text
                style={{
                  color: Colors.red,
                  marginTop: 20,
                  fontSize: 18
                }}
              >Oops! We can&apos;t edit this content right now.</Text>)
            })
          } else {
            navigation.navigate('_createConversation', {
              update: conversation,
              feedVariables
            })
          }
        }}
        onReport={_onReport}
        type='conversation'
      >
        <UserBlock
          user={posted_by}
          school={school}
        />
      </ContentActionsMenu>
      <View>
        <View style={{ marginTop: 10, paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={() => {onOpenConversation(conversation.id)}}
          >
            <View
              style={{ paddingHorizontal: 20 }}
            >
              <MentionsText
                messages={message}
                onPress={(registration_id) => {
                  navigation.navigate('_fullProfile', {
                    targetId: registration_id
                  })
                }}
              />
              <Text style={styles.timeAgo}>{timeAgo(creation_date)}</Text>
            </View>
          </TouchableOpacity>
          <ReactionSection
            conversation_id={conversation.id}
            content={conversation}
            feedVariables={feedVariables}
            onToggleComments={onToggleComments}
          />
          {Boolean(shouldShowComments) && <CommentList
            feedVariables={feedVariables}
            conversation={conversation}
            showFirstCommentOnly={showFirstCommentOnly}
            isCommentPaginationEnabled={isCommentPaginationEnabled}
            isReplyPaginationEnabled={isReplyPaginationEnabled}
            focusContent={focusContent}
            focusedCommentId={focusedCommentId}
            onLayout={(ref) => {
              if (shouldFocusComments && focusContent) {
                focusContent(conversation, ref);
              }
            }}
            newContent={newContent}
          />}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  timeAgo: {
    fontSize: 12,
    color: Colors.blackRGBA(0.5),
    marginTop: 20
  }
})
