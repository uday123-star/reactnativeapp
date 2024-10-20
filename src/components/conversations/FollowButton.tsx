import { useMutation } from '@apollo/client'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { TouchableHighlight, View } from 'react-native'
import { AddFollowInput, AddFollowResponse, ADD_FOLLOW, DeleteFollowInput, DeleteFollowResponse, DELETE_FOLLOW } from '../../../data/queries/conversations/follows'
import { Conversation } from '../../../data/queries/conversations/types'
import { useCurrentAffiliation, useIsSignedIn } from '../../../redux/hooks'
import { Colors } from '../../../styles/colors'
import { logEvent } from '../../helpers/analytics'
import BasicAlert from '../BasicAlert'
import { Text } from '../Text'

interface Props {
  conversation: Conversation
}

export const FollowButton = ({ conversation }: Props) => {
  const [isFollowing, setIsFollowing] = useState(!!(conversation.myFollow))
  const [userFollow, setUserFollow] = useState(conversation.myFollow)
  const isSignedInUser = useIsSignedIn(conversation.posted_by.registration_id)
  const { id: currentAffiliationId } = useCurrentAffiliation();

  const [addFollow, { data: addFollowData, loading: addFollowLoading, error: addFollowError }] = useMutation<AddFollowResponse>(ADD_FOLLOW, {
    fetchPolicy: 'no-cache'
  });
  const [deleteFollow, { data: delFollowData, loading: delFollowLoading, error: delFollowError }] = useMutation<DeleteFollowResponse>(DELETE_FOLLOW, {
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    if (!addFollowLoading && (addFollowData || addFollowError)) {
      // refetchConversation();
      if (addFollowError) {
        BasicAlert.show({
          title: 'Follow',
          text: 'Oops! There was an error adding your follow, try again later.',
        });
      }
    }
  }, [addFollowData, addFollowLoading, addFollowError]);

  useEffect(() => {
    setIsFollowing(!!(conversation.myFollow));
    setUserFollow(conversation.myFollow);
  }, [conversation.myFollow])

  useEffect(() => {
    if (!delFollowLoading && (delFollowData || delFollowError)) {
      // refetchConversation();
      if (delFollowError) {
        BasicAlert.show({
          title: 'Follow',
          text: 'Oops! There was an error removing your follow, try again later.',
        });
      }
    }
  }, [delFollowData, delFollowLoading, delFollowError]);

  const doFollow = () => {
    const _isFollowing = isFollowing;

    setIsFollowing(!isFollowing)

    try {
      if (_isFollowing && userFollow) {
        const variables: DeleteFollowInput = {
          id: userFollow.id
        };
        deleteFollow({
          variables,
          fetchPolicy: 'no-cache',
          onCompleted: (data) => {
            logEvent('delete_follow', data?.deleteFollow);
          },
          onError: (error) => {
            DdRum.addError(
              error.message || 'error while removing a follow',
              ErrorSource.SOURCE,
              error.stack || __filename,
              {
                error,
                variables
              },
              Date.now()
            )
          }
        });
      } else {
        const variables: AddFollowInput = {
          followInput: {
            conversation_id: conversation.id
          },
          authorAffiliationId: currentAffiliationId
        };
        addFollow({
          variables,
          fetchPolicy: 'no-cache',
          onCompleted: (data) => {
            const { addFollow: follow } = data;
            logEvent('conversations_follow', {
              conversation_id: follow.conversation_id,
              follow_id: follow.id
            });
          },
          onError: (error) => {
            DdRum.addError(
              error.message || 'error while adding a follow',
              ErrorSource.SOURCE,
              error.stack || __filename,
              {
                error,
                variables
              },
              Date.now()
            )
          }
        });
      }
    } catch (e) {
      // TODO ? should we alert the UI in case of failure ??

      // revert the follow button to original state in the UI
      setIsFollowing(_isFollowing);
    }
  }

  return (
    <View>
      {!isSignedInUser && (
        <View style={{ display: 'flex' }}>
          <TouchableHighlight
            underlayColor={Colors.darkGray}
            style={{
              borderRadius: 10,
            }}
            onPress={() => {
              if (!addFollowLoading && !delFollowLoading) {
                doFollow()
              }
            }}
          >
            <View style={[
              { borderWidth: 1, borderColor: Colors.darkCyan, borderRadius: 10, opacity: (!addFollowLoading && !delFollowLoading) ? 1 : 0.2 },
              isFollowing ? {
                backgroundColor: Colors.darkCyan
              } : {}
            ]}
            >
              <Text style={[
                { textAlign: 'right', paddingHorizontal: 10 },
                isFollowing ? { color: Colors.whiteRGBA() } : { color: Colors.darkCyan }
              ]}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      )}
    </View>
  )
}
