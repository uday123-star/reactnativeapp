import { useMutation } from '@apollo/client'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { DELETE_REPLY, DelReplyResponse } from '../../../data/queries/conversations/delete_reply'
import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types'
import { ReportReplyResponse, REPORT_REPLY } from '../../../data/queries/security/report_conversations'
import { Colors } from '../../../styles/colors'
import { ConversationsStackParamList } from '../../../types/types'
import { timeAgo } from '../../helpers/conversations'
import { getSessionData } from '../../helpers/session'
import BasicAlert from '../BasicAlert'
import { Text } from '../Text'
import { ContentActionsMenu } from './ContentActionsMenu'
import { ConversationReports } from './ConversationReports'
import { MentionsText } from './mentions'
import { ReactionSection } from './ReactionsSection'
import { UserBlock } from './UserBlock'

interface Props {
  reply: Reply
  shouldFocusContent?: boolean
  focusContent?: (item: Conversation | Comment | Reply, ref: View) => void
  conversationId: string
}

export const ReplyBlock = ({ reply, conversationId, shouldFocusContent = false, focusContent }: Props) => {
  const { posted_by, school, message, creation_date } = reply;
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const container = useRef<View>();
  const route = useRoute();

  const [ deleteReply, { data: dataDelete, loading: loadingDelete, error: errorDelete } ] = useMutation<DelReplyResponse>(DELETE_REPLY);
  const [ reportReply, { data: dataReport, loading: loadingReport, error: errorReport } ] = useMutation<ReportReplyResponse>(REPORT_REPLY);

  useEffect(() => {
    if (errorDelete) {
      BasicAlert.show({
        title: 'Conversations',
        text: 'Oops! There was an error trying to delete you reply, try again later.'
      })
    }
  }, [dataDelete, loadingDelete, errorDelete])

  if (!conversationId) {
    throw new Error('reply block is missing conversationId')
  }

  const doDelete = () => {
    const sessionData = getSessionData();
    deleteReply({
      variables: {
        id: reply.id
      },
      fetchPolicy: 'network-only',
      update: (cache, { data }) => {
        if (data) {
          const { deleteReply: { id , comment_id }} = data;
          const cachedCommentId = cache.identify({
            __typename: 'Comment',
            id: comment_id
          });
          if (cachedCommentId) {
            cache.modify({
              id: cachedCommentId,
              fields: {
                replies_count(replies_count: number) {
                  return replies_count - 1;
                }
              }
            });
          }
          const cachedReplyId = cache.identify({
            __typename: 'Reply',
            id
          });
          if (cachedReplyId) {
            cache.modify({
              id: cachedReplyId,
              fields: (comment, { DELETE }) => {
                return DELETE;
              }
            });
          }
        }
      },
      onError: (error) => DdRum.addError('Delete Reply', ErrorSource.CUSTOM, error.message || 'Error deleting reply', {
        session: sessionData,
        content: reply
      }, Date.now()),
      onCompleted: (data) => DdRum.addAction(RumActionType.CUSTOM, 'Delete Reply', {
        session: sessionData,
        content: data?.deleteReply
      }, Date.now())
    })
  }

  useEffect(() => {
    if (!loadingReport && !errorReport && dataReport) {
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
    }
    if (errorReport) {
      BasicAlert.show({
        title: 'Report Content',
        text: 'Oops! There was an error trying to send your report, try again later.'
      })
    }
  }, [dataReport, loadingReport, errorReport])

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
        reportReply({
          variables: {
            id: reply.id
          }
        })
      }
    })
  }

  return (
    <View
      ref={container as React.LegacyRef<View>}
      style={{
        flex: 1,
        backgroundColor: shouldFocusContent ? Colors.focusedComment : Colors.commentBackground,
        paddingLeft: 15
      }}
      onLayout={() => {
        if (shouldFocusContent && focusContent) {
          focusContent(reply, container.current as View)
        }
      }}
    >
      <ContentActionsMenu
        content={reply}
        onDelete={doDelete}
        onEdit={() => {
          const mention = reply.message.find((m) => m.entityRanges.find((e) => e.entity.type === 'mention'));
          if (mention) {
            BasicAlert.show({
              title: 'Reply',
              text: (<Text
                style={{
                  color: Colors.red,
                  marginTop: 20,
                  fontSize: 18
                }}
              >Oops! We can&apos;t edit this content right now.</Text>)
            })
          } else {
            navigation.navigate('_createReply', {
              update: reply,
              commentId: reply.comment_id,
              conversationId,
              parentName: route.name,
              parentSchoolInfo: reply.school
            })
          }
        }}
        onReport={_onReport}
        type='reply'
      >
        <UserBlock user={posted_by}
          school={school}
          containerStyles={{ marginLeft: 0 }}
        />
      </ContentActionsMenu>
      <MentionsText
        messages={message}
        onPress={(registration_id) => {
          navigation.navigate('_fullProfile', {
            targetId: registration_id
          })
        }}
      />
      <Text isBold style={styles.timeAgo}>{timeAgo(creation_date)}</Text>
      <ReactionSection
        conversation_id={conversationId}
        content={reply}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  timeAgo: {
    fontSize: 12,
    color: Colors.blackRGBA(0.5),
    marginVertical: 10
  }
})
