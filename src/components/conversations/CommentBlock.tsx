import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types'
import { Colors } from '../../../styles/colors'
import { timeAgo } from '../../helpers/conversations'
import { Text } from '../Text'
import { UserBlock } from './UserBlock'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { ConversationsStackParamList, NewContentInfo } from '../../../types/types'
import { ContentActionsMenu } from './ContentActionsMenu'
import { useMutation } from '@apollo/client'
import BasicAlert from '../BasicAlert'
import { DelCommentResponse, DELETE_COMMENT } from '../../../data/queries/conversations/delete_comment'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { ReplyList } from './ReplyList'
import { ReportCommentResponse, REPORT_COMMENT } from '../../../data/queries/security/report_conversations'
import { ConversationReports } from './ConversationReports'
import { ReactionSection } from './ReactionsSection'
import { MentionsText } from './mentions'
import { getSessionData } from '../../helpers/session'

interface Props {
  comment: Comment
  shouldFocusContent?: boolean
  expandReplies: boolean
  focusContent?: (item: Conversation | Comment | Reply, ref: View) => void
  newContent?: NewContentInfo
  conversationHighlighted: boolean | undefined
}

export const CommentBlock = ({ comment, shouldFocusContent = false, expandReplies, focusContent, newContent, conversationHighlighted }: Props) => {
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const { posted_by, school, creation_date, message, conversation_id, id: commentId } = comment
  const container = useRef<View>();
  const [ loadingReplies, setLoadingReplies ] = useState(false);
  const route = useRoute();

  const [shouldShowReplies, setShouldShowReplies] = useState((newContent?.comment_id === comment.id || expandReplies))

  const [ deleteComment, { data: dataDelete, loading: loadingDelete, error: errorDelete } ] = useMutation<DelCommentResponse>(DELETE_COMMENT);
  const [ reportComment, { data: dataReport, loading: loadingReport, error: errorReport } ] = useMutation<ReportCommentResponse>(REPORT_COMMENT);

  useEffect(() => {
    if (errorDelete) {
      BasicAlert.show({
        title: 'Conversations',
        text: 'Oops! There was an error trying to delete you comment, try again later.'
      })
    }
  }, [dataDelete, loadingDelete, errorDelete])

  const _deletePost = () => {
    const sessionData = getSessionData();
    deleteComment({
      variables: {
        id: comment.id
      },
      fetchPolicy: 'network-only',
      update: (cache, { data }) => {
        if (data) {
          const { deleteComment: { id ,conversation_id }} = data;
          const cachedConvoId = cache.identify({
            __typename: 'Conversation',
            id: conversation_id
          });
          if (cachedConvoId) {
            cache.modify({
              id: cachedConvoId,
              fields: {
                comments_count(comments_count: number) {
                  return comments_count - 1;
                }
              }
            });
          }
          const cachedCommId = cache.identify({
            __typename: 'Comment',
            id
          });
          if (cachedCommId) {
            cache.modify({
              id: cachedCommId,
              fields: (comment, { DELETE }) => {
                return DELETE;
              }
            });
          }
        }
      },
      onError: (error) => DdRum.addError('Delete Comment', ErrorSource.CUSTOM, error.message || 'Error deleting comment', {
        session: sessionData,
        content: comment
      }, Date.now()),
      onCompleted: (data) => DdRum.addAction(RumActionType.CUSTOM, 'Delete Comment', {
        session: sessionData,
        content: data?.deleteComment
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
        text: 'Oops! There was an error trying to send yout report, try again later.'
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
        reportComment({
          variables: {
            id: comment.id
          }
        })
      }
    })
  }

  const onToggleReplies = () => {
    if (route.name === '_feed') {
      navigation.navigate('_conversation', {
        id: conversation_id,
        shouldFocusComments: true,
        focusedCommentId: commentId
      })
    } else {
      setShouldShowReplies(prev => !prev)
    }
  }

  return (
    <View
      ref={container as React.LegacyRef<View>}
      style={{
        backgroundColor: shouldFocusContent ? Colors.focusedComment : Colors.commentBackground
      }}
      onLayout={() => {
        if (shouldFocusContent && focusContent) {
          focusContent(comment, container.current as View)
        }
      }}
    >
      <ContentActionsMenu
        content={comment}
        onDelete={_deletePost}
        onEdit={() => {
          const mention = comment.message.find((m) => m.entityRanges.find((e) => e.entity.type === 'mention'));
          if (mention) {
            BasicAlert.show({
              title: 'Comment',
              text: (<Text
                style={{
                  color: Colors.red,
                  marginTop: 20,
                  fontSize: 18
                }}
              >Oops! We can&apos;t edit this content right now.</Text>)
            })
          } else {
            navigation.navigate('_createComment', {
              update: comment,
              conversationId: comment.conversation_id,
              parentName: route.name,
              parentSchoolInfo: comment.school
            })
          }
        }}
        onReport={_onReport}
        type='comment'
      >
        <UserBlock user={posted_by} school={school} />
      </ContentActionsMenu>
      <>
        <View style={{
            marginLeft: 20,
            flex: 1
          }}
        >
          <View style={{
              margin: 20,
              marginBottom: 0,
              marginTop: 0,
              marginHorizontal: 0,
            }}
          >
            <MentionsText
              messages={message}
              onPress={(registration_id) => {
                navigation.navigate('_fullProfile', {
                  targetId: registration_id
                })
              }}
            />
            <Text isBold style={styles.timeAgo}>{timeAgo(creation_date)}</Text>
          </View>
        </View>
        <View style={{
            marginTop: 0,
            marginHorizontal: 0
          }}
        >
          <View style={{
              flexDirection: 'row'
            }}
          >
            <ReactionSection
              conversation_id={comment.conversation_id}
              content={comment}
              onToggleReplies={onToggleReplies}
              loadingContent={loadingReplies}
            />
          </View>
          {shouldShowReplies &&
            <ReplyList
              comment={comment}
              focusContent={focusContent}
              newContent={newContent}
              loadingReplies={setLoadingReplies}
              conversationHighlighted={conversationHighlighted}
            />
          }
        </View>
      </>
    </View>
  )
}

const styles = StyleSheet.create({
  commentText: {
    marginBottom: 20
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.blackRGBA(0.5)
  }
})
