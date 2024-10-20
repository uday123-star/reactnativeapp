import { useQuery } from '@apollo/client'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { FetchRepliesResponse, FETCH_REPLIES } from '../../../data/queries/conversations/get_replies'
import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types'
import { Colors } from '../../../styles/colors'
import { NewContentInfo } from '../../../types/types'
import { Text } from '../Text'
import { FetchMoreButton } from './FetchMoreButton'
import { ReplyBlock } from './ReplyBlock'

interface Props {
  comment: Comment
  focusContent?: (item: Conversation | Comment | Reply, ref: View) => void
  newContent?: NewContentInfo
  loadingReplies: (loading: boolean) => void
  conversationHighlighted: boolean | undefined
}

export const ReplyList = ({ comment, focusContent, newContent, loadingReplies, conversationHighlighted }: Props) => {

  const { data, loading, error } = useQuery<FetchRepliesResponse>(FETCH_REPLIES, {
    variables: {
      commentId: comment.id,
      limit: 10
    },
    fetchPolicy: 'cache-and-network',
    onError(error) {
      DdRum.addError('An error occurred while fetching replies',
        ErrorSource.SOURCE,
        error.stack || '',
        {
          comment
        },
        Date.now()
      )
    },
    onCompleted(data) {
      DdRum.addAction(RumActionType.CUSTOM, 'loaded replies for a comment', { data, comment }, Date.now())
    }
  })

  // Bubbles up loading state to parent for use
  // by sibling reaction component.
  React.useEffect(() => {
    loadingReplies(loading);
  }, [loading])

  // protects against loading state, missing data or empty list
  if (loading || !data || !data.replies.length) {
    return <View />
  }

  if (error && error.message) {
    return (
      <Text style={{ color: Colors.red }}>Oops, an error occurred.</Text>
    )
  }

  const { replies = []} = data;
  const shouldShowPaginationButton = replies.length < comment.replies_count;

  return (
    <View style={styles.wrapper}>
      {(replies).map(reply =>{
        const shouldFocusContent = !!(newContent &&
          newContent.type === 'reply' &&
          newContent.id === reply.id) && !conversationHighlighted;
        return (
          <ReplyBlock
            reply={reply}
            key={reply.id}
            focusContent={focusContent}
            conversationId={comment.conversation_id}
            shouldFocusContent={shouldFocusContent}
          />
        )}
      )}

      {Boolean(shouldShowPaginationButton) &&
        <FetchMoreButton content={comment} />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(204, 204, 204, 0.75)',
    marginLeft: 20
  }
})
