import React, { useContext } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { CommentBlock } from './CommentBlock'
import { Comment, Conversation, Post, Reply } from '../../../data/queries/conversations/types'
import { UserAvatar } from '../UserAvatar'
import { Colors } from '../../../styles/colors'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { ConversationsStackParamList, NewContentInfo } from '../../../types/types'
import { globalStyles } from '../../../styles/global-stylesheet'
import { ConversationFeedVariables } from '../../../types/interfaces'
import { FetchMoreButton } from './FetchMoreButton'
import { useCurrentUser } from '../../../redux/hooks'
import { useLazyQuery } from '@apollo/client'
import { GetCommentsResponse, GET_COMMENTS } from '../../../data/queries/conversations/get_comments'
import { getSessionData } from '../../helpers/session'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { ConversationsContext, ConversationsContextStructure } from '../../helpers/contexts'
import { Text } from '../Text'

interface Props {
  showFirstCommentOnly?: boolean
  isCommentPaginationEnabled?: boolean
  isReplyPaginationEnabled?: boolean
  conversation: Post
  feedVariables: ConversationFeedVariables
  focusedCommentId?: string
  focusContent?: (item: Conversation | Comment | Reply, ref: View) => void
  onLayout: (ref: View) => void
  newContent?: NewContentInfo
}

export const CommentList = ({ conversation, showFirstCommentOnly = false, isCommentPaginationEnabled = false, feedVariables, focusedCommentId, focusContent, onLayout, newContent }: Props) => {
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const currentUser = useCurrentUser();
  const route = useRoute();
  const { comments_count: commentCount = 0, id: conversationId, highlighted } = conversation;

  const { viewableId } = useContext(ConversationsContext) as ConversationsContextStructure;

  const variables = {
    conversationId: conversationId,
    limit: 10
  };

  const [getComments, { data, loading, called }] = useLazyQuery<GetCommentsResponse>(GET_COMMENTS, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    onError: (error) => {
      console.log(JSON.stringify(error))
      const sessionData = getSessionData();
      DdRum.addError('Update Comment', ErrorSource.CUSTOM, error.message || 'Error fetching comments', {
        session: sessionData,
        variables
      }, Date.now())
    }
  })

  if (viewableId === conversationId && !loading && !called) {
    getComments({
      variables
    });
  }

  const _navigateToNewComment = () => {

    // after a comment is successfully created, navigation
    // should goBack() if the routeName is the singleConversation page
    // otherwise the back button will load an extra singleConversation page
    const shouldGoBackWhenComplete = route.name === '_conversation'
    navigation.navigate('_createComment', {
      conversationId,
      feedVariables,
      shouldGoBackWhenComplete,
      parentName: route.name,
      parentSchoolInfo: conversation.school
    })
  }
  const commentsContainer = React.useRef<View>();

  // used to show the button that links
  // to the single conversation page ONLY when
  // more comments are available
  const isMoreCommentsButtonVisible = showFirstCommentOnly && commentCount > 1;

  // used to show the 'show older comments' button
  // that will fetch more comments.
  const shouldShowPaginationButton = isCommentPaginationEnabled && (data?.comments.length || 0) < commentCount;

  const commentHereBlock = () => {
    return (
      <View style={{ flexDirection: 'row', margin: 10 }}>
        <UserAvatar
          user={currentUser}
          avatarSize={40}
          onPress={() => false}
        />
        <TextInput
          onFocus={_navigateToNewComment}
          style={{
            backgroundColor: Colors.whiteRGBA(),
            flex: 1,
            marginLeft: 10,
            borderColor: Colors.ligthGray,
            borderWidth: 1,
            borderRadius: 25,
            paddingLeft: 20
          }}
          placeholderTextColor={Colors.blackRGBA()}
          placeholder='comment here…'
        />
      </View>
    )
  }

  if (!data?.comments.length) {
    return commentHereBlock()
  }

  const filteredComments = showFirstCommentOnly ? data.comments.slice(0, 1) : data.comments;

  const doSeeMore = () => {
    if (route.name !== '_conversation') {
      return navigation.navigate('_conversation', {
        id: conversationId,
        shouldFocusComments: true
      });
    }
  }

  return (
    <View
      ref={commentsContainer as React.LegacyRef<View>}
      onLayout={() => onLayout(commentsContainer.current as View)}
    >
      <View
        style={{ backgroundColor: Colors.commentBackground }}
      >
        {filteredComments.map((comment, i) => {
          const shouldFocusContent = !!(newContent &&
            newContent.type === 'comment' &&
            (newContent.id === comment.id || comment.id === focusedCommentId)) && !highlighted;
          return (
            <CommentBlock
              key={i}
              comment={comment}
              focusContent={focusContent}
              shouldFocusContent={shouldFocusContent}
              expandReplies={!!(focusedCommentId)}
              newContent={newContent}
              conversationHighlighted = {highlighted}
            />
          )
        })}

        {Boolean(isMoreCommentsButtonVisible) && (
          <TouchableOpacity
            onPress={doSeeMore}
          >
            <View
              style={[globalStyles.butonContainerPartialWidth, styles.buttonContainer]}
            >
              <View style={styles.buttonStyle}>
                <Text
                  style={{ color: Colors.blackRGBA(), fontSize: 12 }}
                >SEE MORE COMMENTS</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {Boolean(shouldShowPaginationButton) && (
          <FetchMoreButton content={conversation} />
        )}
      </View>
      <View>
        {commentHereBlock()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 20
  },
  buttonStyle: {
    ...globalStyles.buttonStyle,
    borderColor: Colors.ligthGray,
    borderWidth: 1,
    backgroundColor: Colors.whiteRGBA(),
    paddingVertical: 10
  }
})
