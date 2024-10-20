import { useMutation } from '@apollo/client'
import { StackActions } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { formatDistance } from 'date-fns'
import { AddCommentInputNoAuthor, AddCommentResponse } from '../../data/queries/conversations/add_comment'
import { CreateConversationInput, CreateConversationResponse } from '../../data/queries/conversations/add_post'
import { ConversationsFeedResponse, GET_FEED } from '../../data/queries/conversations/get-feed'
import { GetCommentsResponse, GET_COMMENTS } from '../../data/queries/conversations/get_comments'
import { School } from '../../data/queries/conversations/types'
import { ConversationFeedVariables } from '../../types/interfaces'
import { conversationParams, ConversationsStackParamList } from '../../types/types'
import { logEvent } from './analytics'

type newConversation = ReturnType<typeof useMutation<CreateConversationResponse>>[0];
type newComment = ReturnType<typeof useMutation<AddCommentResponse>>[0];

interface Props {
  mutation: newConversation | newComment
  postType: 'newPost' | 'newComment' | 'reply'
  text: string
  school: School
  conversationId?: string
}

export const timeAgo = (creation_date: string|Date): string => {
  return formatDistance(
    new Date(creation_date),
    new Date(),
    { addSuffix: true }
  )
}

export const processPost = async ({ mutation, postType, text, school, conversationId }: Props) => {
    let variables: CreateConversationInput | AddCommentInputNoAuthor | unknown = null;

    if (postType === 'newPost') {
      variables as CreateConversationInput;
      variables = {
        conversation: {
          message: {
            text: text.trim(),
            entityRanges: []
          },
          school
        }
      }
    }

    if (postType === 'newComment') {
      variables as AddCommentInputNoAuthor
      variables = {
        commentInput: {
          conversation_id: conversationId,
          message: {
            text: text.trim(),
            entityRanges: []
          },
          school
        }
      }
    }

    if (postType === 'reply') {
      // TODO Set variables for adding a reply
    }

    if (!variables) {
      throw new Error('Cannot create post|comment|reply. Invalid post type: ' + postType);
    }

    logEvent('conversations_create');
    return mutation({
      variables,
      update(cache, { data }) {
        if (data) {
          if ('createConversation' in data) {
            const feedVariables: ConversationFeedVariables = {
              gradYear: Number(school.year),
              schoolId: String(school.id),
              limit: 10,
              offset: 0
            };
            const existingData = cache.readQuery<ConversationsFeedResponse>({ query: GET_FEED, variables: feedVariables });
            if (existingData) {
              cache.writeQuery({
                query: GET_FEED,
                variables: feedVariables,
                data: {
                  ...existingData,
                  conversationsFeed: [
                    data.createConversation,
                    ...existingData.conversationsFeed
                  ]
                }
              })
            }
          }
          if ('addComment' in data) {
            const commentsVariables = {
              conversationId,
              limit: 10
            };
            const existingData = cache.readQuery<GetCommentsResponse>({ query: GET_COMMENTS, variables: commentsVariables });
            if (existingData) {
              cache.writeQuery<GetCommentsResponse>({
                query: GET_COMMENTS,
                variables: commentsVariables,
                data: {
                  comments: [
                    data.addComment,
                    ...existingData.comments
                  ]
                }
              })
            }
          }
        }
      },
    })
}

export const focusContent = (
  navigation: NativeStackNavigationProp<ConversationsStackParamList, '_createComment' | '_createReply'>,
  parentName: string,
  params: conversationParams) => {
  const parentNav = navigation.getParent();
  navigation.pop();
  if (parentName === '_conversation') {
    parentNav?.dispatch(
      StackActions.replace('_conversation', params)
    )
  } else {
    parentNav?.navigate('_conversation', params)
  }
}
