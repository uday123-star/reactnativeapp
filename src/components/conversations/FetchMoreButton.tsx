import * as React from 'react'
import { ApolloError, useApolloClient, useLazyQuery } from '@apollo/client'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { StyleSheet } from 'react-native'
import { Button } from '../Button'
import { GetCommentsResponse, GET_COMMENTS } from '../../../data/queries/conversations/get_comments'
import { FetchRepliesResponse, FETCH_REPLIES } from '../../../data/queries/conversations/get_replies'
import { Comment, isComment, isPost, Post } from '../../../data/queries/conversations/types'
import { Colors } from '../../../styles/colors'
import { Text } from '../Text'

interface Props {
  content: Comment|Post
}

export const FetchMoreButton = ({ content }: Props) => {

  const { cache } = useApolloClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const { id } = content;

  const [getComments] = useLazyQuery<GetCommentsResponse>(GET_COMMENTS, {
    fetchPolicy: 'no-cache'
  });

  const [getReplies] = useLazyQuery<FetchRepliesResponse>(FETCH_REPLIES, {
    fetchPolicy: 'no-cache'
  });

  function getData () {
    switch (true) {
      case isPost(content): doShowOlderComments();
        break;
      case isComment(content): doShowOlderReplies();
        break;
      default:
        throw new Error('invalid data in fetch more. Expecting a Post or a Comment.')
    }
  }

  function doShowOlderReplies() {
    if (!isComment(content)) {
      return;
    }

    setIsLoading(true)

    const variables = {
      commentId: id,
      limit: 0
    }

    getReplies({
      variables,
      onCompleted({ replies }) {
        const existingData = cache.readQuery<FetchRepliesResponse>({ query: FETCH_REPLIES, variables: {
          ...variables,
          limit: 10
        }});
        if (existingData) {
          cache.writeQuery<FetchRepliesResponse>({
            query: FETCH_REPLIES,
            variables: {
              ...variables,
              limit: 10
            },
            data: {
              replies
            }
          });
        }
        setIsLoading(false)
      },
      onError(error) {
        reportDdRumError(error, 'error while fetching all replies for a post', { content, variables })
        setIsLoading(false)
      }
    })
  }

function doShowOlderComments () {
    setIsLoading(true)

    const variables = {
      conversationId: id,
      limit: 0
    }

    getComments({
      variables,
      onCompleted({ comments }) {
        const existingData = cache.readQuery<GetCommentsResponse>({ query: GET_COMMENTS, variables: {
          ...variables,
          limit: 10
        }});
        if (existingData) {
          cache.writeQuery<GetCommentsResponse>({
            query: GET_COMMENTS,
            variables: {
              ...variables,
              limit: 10
            },
            data: {
              comments
            }
          });
        }
        setIsLoading(false)
      },
      onError(error) {
        reportDdRumError(error, 'error while fetching all comments for a post', { content, variables })
        setIsLoading(false)
      }
    })
  }

  return (
    <Button
      onPress={getData}
      style={styles.buttonStyle}
      disabled={isLoading}
      backgroundColor={Colors.whiteRGBA()}
      isPartialWidth={true}
      accessibilityLabel='older comments'
      accessible={false}
    >
      <Text
        style={{ color: isLoading ? Colors.disabledText : Colors.blackRGBA(), fontSize: 12 }}
      >
        {`${isLoading ? 'LOADING' : 'SHOW'} ${isPost(content) ? 'OLDER COMMENTS' : 'OLDER REPLIES'}`}
      </Text>
    </Button>
  )
}

function reportDdRumError(error: ApolloError, message = '', context = {}) {
  DdRum.addError(
    error.message || message,
    ErrorSource.SOURCE,
    error.stack || __filename,
    { error, context },
    Date.now()
  )
}

const styles = StyleSheet.create({
  buttonStyle: {
    margin: 20,
    borderColor: Colors.ligthGray,
    borderWidth: 1,
    paddingVertical: 10
  },
})
