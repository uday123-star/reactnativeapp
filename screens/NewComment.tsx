import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCurrentAffiliation } from '../redux/hooks'
import { logEvent } from '../src/helpers/analytics'
import { conversationParams, ConversationsStackParamList } from '../types/types'
import { AddCommentInputNoAuthor, AddCommentResponse, ADD_COMMENT } from '../data/queries/conversations/add_comment'
import { Message, SchoolInput } from '../data/queries/conversations/types'
import { NewPost } from '../src/components/conversations/NewPost'
import BasicAlert from '../src/components/BasicAlert'
import { globalStyles } from '../styles/global-stylesheet'
import { Text } from '../src/components/Text'
import { Colors } from '../styles/colors'
import { UpdateCommentResponse, UPDATE_COMMENT } from '../data/queries/conversations/update_comment'
import { getSessionData } from '../src/helpers/session'
import { GetCommentsResponse, GET_COMMENTS } from '../data/queries/conversations/get_comments'
import { useAffiliationYearRange } from '../src/hooks'
import { focusContent } from '../src/helpers/conversations'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_createComment'>

export const postTypeScreenData = {
  title: 'Comment',
  placeholder: 'Start typing your comment here',
  ddActionName: 'Submit a new conversation post',
  eventName: 'conversations_comment'
}

export const NewComment = ({ route, navigation }: Props) => {

  const { conversationId = '', update, parentName, parentSchoolInfo } = route.params;
  const { schoolName, schoolId, id: currentAffiliationId } = useCurrentAffiliation()
  const { end: endYear, isStudent } = useAffiliationYearRange();
  const [ updateComment, { data: dataUpdate, loading: loadingUpdate, error: errorUpdate } ] = useMutation<UpdateCommentResponse>(UPDATE_COMMENT);

  useEffect(() => {
    if (errorUpdate) {
      BasicAlert.show({
        title: 'Conversations',
        text: (<Text style={[globalStyles.normalText, {
          fontSize: 20,
          marginTop: 20,
          color: Colors.red
        }]}
        >{errorUpdate.message || 'Oops! There was an error trying to update you comment, try again later.'}</Text>)
      });
    }
  }, [dataUpdate, loadingUpdate, errorUpdate])

  const school: SchoolInput = isStudent ? {
    name: schoolName,
    id: schoolId,
    year: Number(endYear)
  } : {
    name: parentSchoolInfo.name,
    id: parentSchoolInfo.id,
    year: parentSchoolInfo.year,
  };

  if (!conversationId) {
    throw new Error('Cannot create new comment. Missing conversationId');
  }

  const [newComment] = useMutation<AddCommentResponse>(ADD_COMMENT)

  // Listens for the 'post' event. Leverages the processPost helper
  // to call the mutation with appropriate args.
  const onPost = async (msg: Message[]) => {
    if (update) {
      await updatePost(msg, update.id)
    } else {
      await addPost(msg);
    }
  }

  const addPost = async (msg: Message[]) => {
    const ddActionName = postTypeScreenData.ddActionName;
    const { TAP } = RumActionType;
    DdRum.addAction(TAP, ddActionName, {}, Date.now());

    const variables: AddCommentInputNoAuthor = {
      commentInput: {
        conversation_id: conversationId,
        message: msg,
        school
      },
      authorAffiliationId: currentAffiliationId
    }

    try {
      await newComment({
        variables,
        errorPolicy: 'none',
        update(cache, { data }) {
          if (conversationId && data) {
            const cachedId = cache.identify({
              __typename: 'Conversation',
              id: data?.addComment.conversation_id,
            });
            cache.modify({
            id: cachedId,
            fields: {
              highlighted: () => false,
            }
          });
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
        },
        onCompleted(data) {
          const { addComment: comment } = data;
          logEvent(postTypeScreenData.eventName, {
            conversation_id: comment.conversation_id,
            comment_id: comment.id
          });

          const { CUSTOM } = RumActionType;
          DdRum.addAction(CUSTOM, 'new comment added', {
            data
          },
            Date.now()
          )

          const { id } = data.addComment;

          const params: conversationParams = {
            id: conversationId,
            newContent: {
              id,
              type: 'comment'
            }
          };
          focusContent(navigation, parentName, params);
        }
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch ({ message = 'Oops. Something went wrong. Please try again.' }: any) {
      BasicAlert.show({
        title: 'Conversations',
        text: (
          <Text style={[globalStyles.normalText, {
            fontSize: 20,
            marginTop: 20,
            color: Colors.red
          }]}
          >
            {message}
          </Text>
        )
      });
    }
  }

  const updatePost = async (message: Message[], id: string) => {
    const variables = {
      id,
      message
    };
    const sessionData = getSessionData();
    await updateComment({
      variables,
      fetchPolicy: 'no-cache',
      update: (cache, { data }) => {
        const cachedId = cache.identify({
          __typename: 'Comment',
          id
        });
        cache.modify({
          id: cachedId,
          fields: {
            message: () => data?.updateComment.message
          }
        })
      },
      onError: (error) => DdRum.addError('Update Comment', ErrorSource.CUSTOM, error.message || 'Error updating comment', {
        session: sessionData,
        content: update
      }, Date.now()),
      onCompleted: (data) => {
        DdRum.addAction(RumActionType.CUSTOM, 'Update Comment', {
          session: sessionData,
          content: data?.updateComment
        }, Date.now());
        const params: conversationParams = {
          id: conversationId,
          newContent: {
            id,
            type: 'comment'
          }
        };
        focusContent(navigation, parentName, params);
      }
    })
  }

  return (
    <NewPost
      placeholder={postTypeScreenData.placeholder}
      message={update?.message}
      onPost={onPost}
      school={school}
    />
  )
}
