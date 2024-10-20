import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ADD_CONVERSATION, CreateConversationInput, CreateConversationResponse } from '../data/queries/conversations/add_post'
import { useCurrentAffiliation } from '../redux/hooks'
import { logEvent } from '../src/helpers/analytics'
import { ConversationsStackParamList } from '../types/types'
import { Conversation, Message } from '../data/queries/conversations/types'
import { ConversationsFeedResponse, GET_FEED } from '../data/queries/conversations/get-feed'
import cloneDeep from 'lodash/cloneDeep'
import { NewPost } from '../src/components/conversations/NewPost'
import { Text } from '../src/components/Text'
import BasicAlert from '../src/components/BasicAlert'
import { globalStyles } from '../styles/global-stylesheet'
import { Colors } from '../styles/colors'
import { UpdateConversationResponse, UPDATE_CONVERSATION } from '../data/queries/conversations/update_conversation'
import { getSessionData } from '../src/helpers/session'
import { useAffiliationYearRange } from '../src/hooks'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_createConversation'>

const postTypeScreenData = {
  title: 'Conversations',
  placeholder: 'What\'s on your mind?',
  ddActionName: 'Submit a new comment',
  eventName: 'conversations_create'
}

export const NewConversation = ({ navigation, route }: Props) => {
  const { params } = route;
  const { feedVariables, update } = params;

  const currentAffiliation = useCurrentAffiliation()
  const { schoolId, schoolName, id: currentAffiliationId } = currentAffiliation;
  const { end: endYear } = useAffiliationYearRange();
  const [ updateConversation, { data: dataUpdate, loading: loadingUpdate, error: errorUpdate } ] = useMutation<UpdateConversationResponse>(UPDATE_CONVERSATION);

  useEffect(() => {
    if (errorUpdate) {
      BasicAlert.show({
        title: 'Conversations',
        text: (<Text style={[globalStyles.normalText, {
          fontSize: 20,
          marginTop: 20,
          color: Colors.red
        }]}
        >{errorUpdate.message || 'Oops! There was an error trying to update you post, try again later.'}</Text>)
      });
    }
  }, [dataUpdate, loadingUpdate, errorUpdate])

  const [addConversation] = useMutation<CreateConversationResponse>(ADD_CONVERSATION)

  // Listener for the 'post' event
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

    const variables: CreateConversationInput = {
      conversation: {
        message: msg,
        school: {
          id: schoolId,
          name: schoolName,
          year: Number(endYear)
        }
      },
      authorAffiliationId: currentAffiliationId
    }
    try {
      await addConversation({
        variables,
        errorPolicy: 'none',
        update(cache, { data }) {

          const cachedFeed = cache.readQuery<ConversationsFeedResponse>({
            query: GET_FEED,
            variables: feedVariables
          })

          // data.createConversation is a single conversation object
          // cachedFeed is a collection of conversation objects
          if (cachedFeed && data?.createConversation) {

            // conversationsFeed is an array of conversations
            const { conversationsFeed = []} = cachedFeed;
            const newFeed = cloneDeep<Conversation[]>(conversationsFeed).map((conversation) => ({
              ...conversation,
              highlighted: false
            }));

            // unshift new item onto beginning of feed
            newFeed.unshift({
              ...data.createConversation,
              highlighted: true
            });

            cache.writeQuery({
              query: GET_FEED,
              variables: feedVariables,
              data: {
                conversationsFeed: newFeed
              }
            });
          }
        },
        onCompleted(data) {
          const { createConversation: conversation } = data;
          logEvent(postTypeScreenData.eventName, {
            conversation_id: conversation.id
          });
          // navigate back
          navigation.goBack();
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
    await updateConversation({
      variables,
      fetchPolicy: 'no-cache',
      update: (cache, { data }) => {
        const cachedFeed = cache.readQuery<ConversationsFeedResponse>({
          query: GET_FEED,
          variables: feedVariables
        })

        // cachedFeed is a collection of conversation objects
        if (cachedFeed) {

          // conversationsFeed is an array of conversations
          const { conversationsFeed = []} = cachedFeed;
          const newFeed = cloneDeep<Conversation[]>(conversationsFeed).map((conversation) => ({
            ...conversation,
            highlighted: false
          }));

          cache.writeQuery({
            query: GET_FEED,
            variables: feedVariables,
            data: {
              conversationsFeed: newFeed
            }
          });
        }

        const cachedId = cache.identify({
          __typename: 'Conversation',
          id
        });
        cache.modify({
          id: cachedId,
          fields: {
            message: () => data?.updateConversation.message,
            highlighted: () => true
          }
        })
      },
      onError: (error) => DdRum.addError('Update Conversation', ErrorSource.CUSTOM, error.message || 'Error updating conversation', {
        session: sessionData,
        content: update
      }, Date.now()),
      onCompleted: (data) => {
        DdRum.addAction(RumActionType.CUSTOM, 'Update Conversation', {
          session: sessionData,
          content: data?.updateConversation
        }, Date.now())
        navigation.goBack();
      }
    })
  }

  return (
    <NewPost
      placeholder={postTypeScreenData.placeholder}
      message={update?.message}
      onPost={onPost}
    />
  )
}
