import { useMutation } from '@apollo/client'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import { AddReplyInputNoAuthor, AddReplyResponse, ADD_REPLY } from '../data/queries/conversations/add_reply'
import { FetchRepliesResponse, FETCH_REPLIES } from '../data/queries/conversations/get_replies'
import { Message, SchoolInput } from '../data/queries/conversations/types'
import { UpdateReplyResponse, UPDATE_REPLY } from '../data/queries/conversations/update_reply'
import { useCurrentAffiliation } from '../redux/hooks'
import BasicAlert from '../src/components/BasicAlert'
import { NewPost } from '../src/components/conversations/NewPost'
import { Text } from '../src/components/Text'
import { logEvent } from '../src/helpers/analytics'
import { focusContent } from '../src/helpers/conversations'
import { getSessionData } from '../src/helpers/session'
import { useAffiliationYearRange } from '../src/hooks'
import { Colors } from '../styles/colors'
import { globalStyles } from '../styles/global-stylesheet'
import { conversationParams, ConversationsStackParamList } from '../types/types'

export const postTypeScreenData = {
  title: 'Reply',
  placeholder: 'Start typing your reply here',
  ddActionName: 'Submit a new conversation post',
  eventName: 'conversations_reply'
}

type Props = NativeStackScreenProps<ConversationsStackParamList, '_createReply'>

export const NewReply = ({ route, navigation }: Props) => {

  const params = route.params;
  const { commentId = '', conversationId, update, parentName, parentSchoolInfo } = params;
  const { schoolName, schoolId, id: currentAffiliationId } = useCurrentAffiliation()
  const { end: endYear, isStudent } = useAffiliationYearRange();
  const [ updateReply, { data: dataUpdate, loading: loadingUpdate, error: errorUpdate } ] = useMutation<UpdateReplyResponse>(UPDATE_REPLY);

  useEffect(() => {
    if (errorUpdate) {
      BasicAlert.show({
        title: 'Conversations',
        text: (<Text style={[globalStyles.normalText, {
          fontSize: 20,
          marginTop: 20,
          color: Colors.red
        }]}
        >{errorUpdate.message || 'Oops! There was an error trying to update you reply, try again later.'}</Text>)
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

  if (!commentId) {
    throw new Error('Can not create new reply, missing comment id');
  }

  if (!conversationId && !update) {
    throw new Error('Can not create new reply, missing conversation id');
  }

  const [newReply] = useMutation<AddReplyResponse>(ADD_REPLY)

  const onPost = async (msg: Message[]) => {
    if (update) {
      await updatePost(msg, update.id);
    } else {
      await addPost(msg);
    }
  }

  const addPost = async (msg: Message[]) => {
    const variables: AddReplyInputNoAuthor = {
      replyInput: {
        comment_id: commentId,
        message: msg,
        school
      },
      authorAffiliationId: currentAffiliationId
    }

    await newReply({
      variables,
      errorPolicy: 'none',
      update(cache, { data }) {
        if (commentId && data) {
          const repliesVariables = {
            commentId,
            limit: 10
          };
          const existingData = cache.readQuery<FetchRepliesResponse>({ query: FETCH_REPLIES, variables: repliesVariables });
          if (existingData) {
            cache.writeQuery<FetchRepliesResponse>({
              query: FETCH_REPLIES,
              variables: repliesVariables,
              data: {
                replies: [
                  data.addReply,
                  ...existingData.replies
                ]
              }
            })
          }
        }

        if (data?.addReply) {
          const { comment_id } = data.addReply;
          const cachedId = cache.identify({
            __typename: 'Comment',
            id: comment_id
          })

          if (cachedId) {
            cache.modify({
              id: cachedId,
              fields: {
                replies_count: (replies_count) => replies_count + 1,
              }
            })
          }
        }
      },
      onCompleted(data) {
        const { addReply: reply } = data;
        logEvent(postTypeScreenData.eventName, {
          conversation_id: conversationId,
          comment_id: reply.comment_id,
          reply_id: reply.id
        })

        const { CUSTOM } = RumActionType;
        DdRum.addAction(CUSTOM, 'new reply added', {
          data
        },
        Date.now()
        )

        const { id, comment_id } = data.addReply;

        const params: conversationParams = {
          id: conversationId,
          newContent: {
            id,
            type: 'reply',
            comment_id,
          }
        };
        focusContent(navigation, parentName, params);
      },
      onError(error) {

        BasicAlert.show({
          title: 'Conversations',
          text: <Text
            style={[globalStyles.normalText, {
              fontSize: 20,
              marginTop: 20,
              color: Colors.red
            }]}
          >
            {error.message}
          </Text>
        })
        DdRum.addError(error?.message || 'Error while creating reply',
        ErrorSource.CONSOLE,
        error?.stack || __filename,
        {
          commentId,
          error
        },
        Date.now()
        )
      }
    })
  }

  const updatePost = async (message: Message[], id: string) => {
    const variables = {
      id,
      message
    };
    const sessionData = getSessionData();
    await updateReply({
      variables,
      fetchPolicy: 'no-cache',
      update: (cache, { data }) => {
        const cachedId = cache.identify({
          __typename: 'Reply',
          id
        });
        cache.modify({
          id: cachedId,
          fields: {
            message: () => data?.updateReply.message
          }
        })
      },
      onError: (error) => DdRum.addError('Update Reply', ErrorSource.CUSTOM, error.message || 'Error updating reply', {
        session: sessionData,
        content: update
      }, Date.now()),
      onCompleted: (data) => {
        DdRum.addAction(RumActionType.CUSTOM, 'Update Reply', {
          session: sessionData,
          content: data?.updateReply
        }, Date.now())

        const params: conversationParams = {
          id: conversationId,
          newContent: data ? {
            id,
            type: 'reply',
            comment_id: data.updateReply.comment_id,
          } : undefined
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
