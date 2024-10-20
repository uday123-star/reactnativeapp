import React from 'react'
import { useState, useEffect } from 'react'
import { Comment, Conversation, isComment, isPost, isReply, ReactionsCount, Reply } from '../../../data/queries/conversations/types'
import { Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Colors } from '../../../styles/colors'
import { Text } from '../Text'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import Ionicon from 'react-native-vector-icons/Ionicons'
import { ReactionsList } from './ReactionsList'
import { AddReactionInput, AddReactionResponse, ADD_REACTION, GetReactionResponse, GET_REACTION, Reaction, ReactionType } from '../../../data/queries/conversations/add_reaction'
import { useCurrentAffiliation, useIsSignedIn } from '../../../redux/hooks'
import { ApolloCache, useMutation, useQuery } from '@apollo/client'
import { DeleteReactionResponse, DELETE_REACTION } from '../../../data/queries/conversations/delete_reaction'
import Tooltip from 'react-native-walkthrough-tooltip'
import { ActivityIndicator } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { ConversationsStackParamList } from '../../../types/types'
import { ConversationFeedVariables } from '../../../types/interfaces'
import { FollowButton } from './FollowButton'
import BasicAlert from '../BasicAlert'
import { ReactionDisplay } from './ReactionDisplay'
import { useContentType } from '../../hooks/conversations/useContentType'
import { usePostingType } from '../../hooks/conversations/useReactionPostingType'
import { logEvent } from '../../helpers/analytics'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { ConversationsContext, ConversationsContextStructure } from '../../helpers/contexts'
import { useContext } from 'react'
import { useAffiliationYearRange } from '../../hooks'

interface Props {
  conversation_id: string
  content: Conversation | Comment | Reply
  feedVariables?: ConversationFeedVariables
  indentation?: number
  onToggleComments?: () => void
  onToggleReplies?: () => void
  loadingContent?: boolean
}

export const ReactionSection = ({
  conversation_id,
  content,
  feedVariables,
  onToggleComments,
  onToggleReplies,
  indentation = 0,
  loadingContent = false,
}: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalInitialTab, setModalInitialTab] = useState(0)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [hasReaction, setHasReaction] = useState<{
    reacted: boolean
    reaction?: Reaction
  }>({
    reacted: false
  });

  const isSignedInUser = useIsSignedIn(content.posted_by.registration_id)
  const { schoolId, schoolName } = useCurrentAffiliation();
  const { end: endYear } = useAffiliationYearRange();
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const route = useRoute();
  const contentType = useContentType(content);
  const postingType = usePostingType(content);
  const currentAffiliation = useCurrentAffiliation();
  const { setScrollEnabled } = useContext(ConversationsContext) as ConversationsContextStructure;

  const [addReaction, { data: addReactionData, loading: addReactionLoading, error: addReactionError }] = useMutation<AddReactionResponse>(ADD_REACTION, {
    fetchPolicy: 'no-cache'
  });

  const [deleteReaction, { data: delReactionData, loading: delReactionLoading, error: delReactionError }] = useMutation<DeleteReactionResponse>(DELETE_REACTION, {
    fetchPolicy: 'no-cache'
  });

  const { data: reactionData, loading: reactionLoading, error: reactionError } = useQuery<GetReactionResponse>(GET_REACTION, {
    variables: {
      entityId: content.id
    },
    fetchPolicy: 'cache-first',
  })

  useEffect(() => {
    if (!reactionLoading && reactionData) {
      if (reactionData.reactionByEntityId) {
        setHasReaction({
          reacted: true,
          reaction: reactionData.reactionByEntityId
        })
      } else {
        setHasReaction({
          reacted: false
        })
      }
    }
  }, [reactionData, reactionLoading, reactionError])

  useEffect(() => {
    if (!addReactionLoading && addReactionError) {
      BasicAlert.show({
        title: 'Reactions',
        text: 'Oops! There was an error adding your reaction, try again later.',
      });
    }
  }, [addReactionData, addReactionLoading, addReactionError]);

  useEffect(() => {
    if (!delReactionLoading && delReactionError) {
      BasicAlert.show({
        title: 'Reactions',
        text: 'Oops! There was an error removing your reaction, try again later.',
      });
    }
  }, [delReactionData, delReactionLoading, delReactionError]);

  useEffect(() => {
    setScrollEnabled(!isTooltipVisible);
  }, [isTooltipVisible]);

  const updateCache = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cache: ApolloCache<any>,
    reaction: Reaction,
    action: 'add' | 'remove'
  ) => {
    const { reaction_type, conversation_id, posting_id } = reaction;
    let entityId = conversation_id || 0;

    if (!isPost(content)) {
      entityId = content.id;
    }

    const cachedContent = cache.identify({
      __typename: contentType,
      id: entityId
    });

    cache.modify({
      id: cachedContent,
      fields: {
        reactions_count(reactions: ReactionsCount) {
          const field = reaction_type === ReactionType.HEARTS ?
            'hearts_count' : reaction_type === ReactionType.LIKES ?
            'likes_count' : 'smiles_count';

          const output = {
            ...reactions,
            [field]:  reactions[field] + (action === 'add' ? 1 : -1),
            reactions_count: reactions.reactions_count + (action === 'add' ? 1 : -1)
          };

          return output;
        }
      }
    });

    const prevReaction = cache.readQuery<GetReactionResponse>({
      query: GET_REACTION,
      variables: {
        entityId: contentType === 'Conversation' ? conversation_id : posting_id
      }
    });
    if (prevReaction) {
      cache.writeQuery<GetReactionResponse>({
        query: GET_REACTION,
        variables: {
          entityId: contentType === 'Conversation' ? conversation_id : posting_id
        },
        data: {
          reactionByEntityId: action === 'add' ? reaction : null
        }
      })
    }
  }
  const createReaction = (reaction_type: ReactionType) => {
    const variables: AddReactionInput = {
      addReactionInput: {
        conversation_id,
        posting_id: content.id,
        posting_type: postingType,
        reaction_type,
        school: {
          id: schoolId,
          name: schoolName,
          year: Number(endYear),
        }
      },
      authorAffiliationId: currentAffiliation.id
    };
    addReaction({
      variables,
      fetchPolicy: 'no-cache',
      update: (cache, { data }) => {
        if (data) {
          updateCache(cache, data.addReaction, 'add');
        }
      },
      onCompleted: (data) => {
        logEvent('add_reaction', data?.addReaction);
      },
      onError: (error) => {
        DdRum.addError(
          error.message || 'error while adding a reaction',
          ErrorSource.SOURCE,
          error.stack || __filename,
          {
            error,
            variables
          },
          Date.now()
        )
      }
    }).then((response) => {
      setReactedStatus(true, response.data?.addReaction);
    });
  }

  const doComment = ({ contentId }: { contentId: string }) => {

    // after a comment is successfully created, navigation
    // should goBack() if the routeName is the singleConversation page
    // otherwise the back button will load an extra singleConversation page
    const shouldGoBackWhenComplete = route.name === '_conversation';
    switch (contentType) {
      case 'Conversation':
        navigation.navigate('_createComment', {
          conversationId: contentId,
          feedVariables, shouldGoBackWhenComplete,
          parentName: route.name,
          parentSchoolInfo: content.school
        });
        break;
      case 'Comment':
        navigation.navigate('_createReply', {
          conversationId: conversation_id,
          commentId: contentId,
          shouldGoBackWhenComplete,
          parentName: route.name,
          parentSchoolInfo: content.school
        });
        break;
      case 'Reply':
        navigation.navigate('_createReply', {
          conversationId: conversation_id,
          commentId: contentId,
          shouldGoBackWhenComplete,
          parentName: route.name,
          parentSchoolInfo: content.school
        });
        break;
    }
  }

  const doReaction = (reaction_type: ReactionType = ReactionType.LIKES) => {
    setIsTooltipVisible(false);
    if (hasReaction.reacted) {
      deleteReaction({
        variables: {
          id: hasReaction.reaction?.id
        },
        fetchPolicy: 'no-cache',
        update: (cache, { data }) => {
          if (data) {
            updateCache(cache, data.deleteReaction, 'remove');
          }
        },
        onCompleted: (data) => {
          logEvent('delete_reaction', data?.deleteReaction);
        },
        onError: (error) => {
          DdRum.addError(
            error.message || 'error while deleting a reaction',
            ErrorSource.SOURCE,
            error.stack || __filename,
            {
              error,
              variables: {
                id: hasReaction.reaction?.id
              }
            },
            Date.now()
          )
        }
      }).then((response) => {
        setReactedStatus(false, response.data?.deleteReaction);
      })
    } else {
      createReaction(reaction_type);
    }
  }

  const TooltipLabel = (reaction_type: ReactionType, selectedIcon: string, unselectedIcon: string, text: string, onPress: () => void) => (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: Colors.ligthGray,
        padding: 10
      }}
    >
      <Pressable onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
          <AntDesignIcon size={20}
            name={(hasReaction.reacted && reaction_type === hasReaction.reaction?.reaction_type) ? selectedIcon : unselectedIcon}
            color={Colors.darkCyan}
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: Colors.darkCyan }}>
            {Boolean(text) && <Text style={{ fontWeight: 'bold', color: Colors.blackRGBA() }}>
              {text}
            </Text>}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  const CustomTooltipMenu = ({ children }: { children: JSX.Element }) => {
    return (
      <Tooltip
        contentStyle={{
          padding: 0
        }}
        arrowStyle={{
          marginTop: -8,
          zIndex: 1
        }}
        content={(<View style={{ flex: 1, flexDirection: 'column' }}>
          {TooltipLabel(ReactionType.SMILES, 'smile-circle', 'smileo', 'Happy', () => {
            doReaction(ReactionType.SMILES)
          })}
          {TooltipLabel(ReactionType.HEARTS, 'heart', 'hearto', 'Love', () => {
            doReaction(ReactionType.HEARTS)
          })}
          {TooltipLabel(ReactionType.LIKES, 'like1', 'like2', 'Like', () => {
            doReaction(ReactionType.LIKES)
          })}
        </View>)}
        isVisible={isTooltipVisible}
        onClose={() => setIsTooltipVisible(false)}
      >
        {children}
      </Tooltip>)
  }

  const setReactedStatus = (status: boolean, reaction?: Reaction) => {
    setHasReaction({
      reacted: status,
      reaction
    });
  }

  const openReactionsModal = (tab: number) => {
    setModalInitialTab(tab);
    setIsModalVisible(true)
  }

  const getReactedIcon = () => {
    switch (hasReaction.reaction?.reaction_type) {
      case ReactionType.SMILES:
        return 'smile-circle'
      case ReactionType.HEARTS:
        return 'heart'
      case ReactionType.LIKES:
        return 'like1'
      default:
        return 'like1'
    }
  }

  const openComments = () => {

    // Conversations will toggle comments and Comments
    // will toggle replies. Using the typename to identify
    // the category.
    if (contentType === 'Conversation') { // this is a conversation OR a comment
      return onToggleComments && onToggleComments()
    }

    if (contentType === 'Comment') {
      return onToggleReplies && onToggleReplies()
    }
  }

  const shouldShowReactionsDisplay = Boolean(content.reactions_count?.reactions_count) || hasReaction.reacted

  if (isPost(content)) {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'baseline' }}>
        <View style={{ flexDirection: 'row', marginVertical: 15, marginHorizontal: (20 + indentation) }}>
          {Boolean(shouldShowReactionsDisplay) &&
            <ReactionDisplay
              likesCount={content.reactions_count.likes_count}
              heartsCount={content.reactions_count.hearts_count}
              smilesCount={content.reactions_count.smiles_count}
              onPress={openReactionsModal}
            />
          }

          {!loadingContent && <TouchableWithoutFeedback onPress={() => openComments()}>
            <View style={{ flexDirection: 'row' }}>
              <Ionicon size={20}
                name='chatbubble'
                color={Colors.darkCyan}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: Colors.darkCyan }}>{content.comments_count || 0}</Text>
            </View>
          </TouchableWithoutFeedback>}
          {Boolean(loadingContent) && <View style={{ flexDirection: 'row' }}>
            <ActivityIndicator size={20}
              color={Colors.darkCyan}
              style={{
                padding: 0,
                margin: 0,
                marginRight: 5
              }}
            />
            <Text style={{ color: Colors.darkCyan }}>{content.comments_count || 0}</Text>
          </View>}
        </View>

        <View style={styles.dividingLine} />

        <View style={{ flexDirection: 'row', marginVertical: 15, marginHorizontal: (20 + indentation) }}>
          {!(isSignedInUser) && <CustomTooltipMenu>
            <Pressable
              onPress={() => {
                if (!addReactionLoading && !reactionLoading && !delReactionLoading) {
                  doReaction()
                }
              }}
              onLongPress={() => {
                if (!hasReaction.reacted) {
                  setIsTooltipVisible(true);
                }
              }}
              delayLongPress={100}
            >
              <View style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'baseline', marginRight: 10 }}>
                {Boolean(!addReactionLoading && !reactionLoading && !delReactionLoading) && <AntDesignIcon size={20}
                  name={hasReaction.reacted ? getReactedIcon() : 'like2'}
                  color={Colors.darkCyan}
                />
                }
                {Boolean(addReactionLoading || reactionLoading || delReactionLoading) && <ActivityIndicator size={20}
                  color={Colors.darkCyan}
                  style={{
                    padding: 0,
                    margin: 0
                  }}
                />
                }
                <Text
                  style={{ color: Colors.darkCyan, paddingLeft: 5 }}
                >Like</Text>
              </View>
            </Pressable>
          </CustomTooltipMenu>
          }
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Ionicon size={20}
              name='chatbubble'
              color={Colors.darkCyan}
            />
            <Text
              onPress={() => doComment({ contentId: content.id })}
              style={{ color: Colors.darkCyan, paddingLeft: 5 }}
            >Comment</Text>
          </View>
          <View style={{ flexGrow: 1 }} />
          <FollowButton conversation={content as Conversation} />
        </View>

        {Boolean(isModalVisible) && <ReactionsList
          postingId={content.id}
          postingType={postingType}
          visible={isModalVisible}
          reactions_count={content.reactions_count}
          tab={modalInitialTab}
          onClose={() => setIsModalVisible(false)}
        />}
      </View>
    )
  }

  if (isComment(content)) {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'baseline' }}>
        <View style={[
          { flexDirection: 'row', marginVertical: 15 },
          (shouldShowReactionsDisplay ? 
            { marginHorizontal: (20 + indentation) } :
            { marginLeft: indentation, marginRight: (20 + indentation) }
          )
          ]}
        >
          {Boolean(shouldShowReactionsDisplay) &&
            <ReactionDisplay
              likesCount={content.reactions_count.likes_count}
              heartsCount={content.reactions_count.hearts_count}
              smilesCount={content.reactions_count.smiles_count}
              onPress={openReactionsModal}
            />
          }

          {!loadingContent && <TouchableWithoutFeedback
            onPress={content.replies_count ? () => openComments() : undefined}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              {!(isSignedInUser) && <CustomTooltipMenu>
                <Pressable
                  onPress={() => {
                    if (!addReactionLoading && !reactionLoading && !delReactionLoading) {
                      doReaction()
                    }
                  }}
                  onLongPress={() => {
                    if (!hasReaction.reacted) {
                      setIsTooltipVisible(true);
                    }
                  }}
                  style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'baseline', marginLeft: 20 }}
                  delayLongPress={100}
                >
                  {Boolean(!addReactionLoading && !reactionLoading && !delReactionLoading) && <AntDesignIcon size={20}
                    name={hasReaction.reacted ? getReactedIcon() : 'like2'}
                    color={Colors.darkCyan}
                  />
                  }
                  {Boolean(addReactionLoading || reactionLoading || delReactionLoading) && <ActivityIndicator size={20}
                    color={Colors.darkCyan}
                    style={{
                      padding: 0,
                      margin: 0
                    }}
                  />
                  }
                  <Text style={{ color: Colors.darkCyan, paddingLeft: 5 }}>Like</Text>
                </Pressable>
              </CustomTooltipMenu>
              }

              <Ionicon size={20}
                name='chatbubble'
                color={Colors.darkCyan}
                style={{ marginLeft: 20 }}
              />
              <Text style={{ color: Colors.darkCyan, marginLeft: 5 }}>{content.replies_count || 0}</Text>
              <Text onPress={() => doComment({ contentId: content.id })} style={{ color: Colors.darkCyan, paddingLeft: 20 }}>Reply</Text>
            </View>
          </TouchableWithoutFeedback>}
          {Boolean(loadingContent) && <View style={[
            { flexDirection: 'row' },
            { marginHorizontal: (20 + indentation) }
            ]}
          >
            <ActivityIndicator size={20}
              color={Colors.darkCyan}
              style={{
                padding: 0,
                margin: 0,
                marginRight: 5
              }}
            />
            <Text style={{ color: Colors.darkCyan }}>{content.replies_count || 0}</Text>
          </View>}
        </View>

        <View style={styles.divider} />

        {Boolean(isModalVisible) && <ReactionsList
          postingId={content.id}
          postingType={postingType}
          visible={isModalVisible}
          reactions_count={content.reactions_count}
          tab={modalInitialTab}
          onClose={() => setIsModalVisible(false)}
        />}
      </View>
    )
  }

  if (isReply(content)) {
    return <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'baseline' }}>
        {Boolean(shouldShowReactionsDisplay) &&
          <ReactionDisplay
            likesCount={content.reactions_count.likes_count}
            heartsCount={content.reactions_count.hearts_count}
            smilesCount={content.reactions_count.smiles_count}
            onPress={openReactionsModal}
            containerStyles={{ paddingRight: 20, alignItems: 'baseline' }}
          />
        }

        {!(isSignedInUser) && <View style={{ flexDirection: 'row' }}>
          <CustomTooltipMenu>
            <Pressable
              onPress={() => {
                if (!addReactionLoading && !reactionLoading && !delReactionLoading) {
                  doReaction()
                }
              }}
              onLongPress={() => {
                if (!hasReaction.reacted) {
                  setIsTooltipVisible(true);
                }
              }}
              style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'baseline' }}
              delayLongPress={100}
            >
              {Boolean(!addReactionLoading && !reactionLoading && !delReactionLoading) && <AntDesignIcon size={20}
                name={hasReaction.reacted ? getReactedIcon() : 'like2'}
                color={Colors.darkCyan}
              />
              }
              {Boolean(addReactionLoading || reactionLoading || delReactionLoading) && <ActivityIndicator size={20}
                color={Colors.darkCyan}
                style={{
                  padding: 0,
                  margin: 0
                }}
              />
              }
              <Text
                style={{ color: Colors.darkCyan, paddingLeft: 5, paddingRight: 20, alignItems: 'baseline' }}
              >Like</Text>
            </Pressable>
          </CustomTooltipMenu>
        </View>
        }

        <Text onPress={() => doComment({ contentId: content.comment_id })} style={{ color: Colors.darkCyan }}>Reply</Text>
      </View>

      <View style={styles.divider} />

      {Boolean(isModalVisible) && <ReactionsList
        postingId={content.id}
        postingType={postingType}
        visible={isModalVisible}
        reactions_count={content.reactions_count}
        tab={modalInitialTab}
        onClose={() => setIsModalVisible(false)}
      />}
    </View>
  }

  // Bad data
  return <Text>Error... invalid content type</Text>
}

const styles = StyleSheet.create({
  divider: {
    flexGrow: 1, backgroundColor: 'transparent', height: 10, width: '100%'
  },
  dividingLine: {
    flexDirection: 'row', height: 1, backgroundColor: '#CCC', width: '100%'
  }
})
