import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Pressable, RefreshControl, View, ViewabilityConfigCallbackPairs, ViewToken, FlatList } from 'react-native';
import { AffiliationDropdown } from '../AffiliationDropdown';
import InfoCircle from '../../../assets/images/info-circle-orange.svg';
import { Text } from '../Text';
import { UserAvatar } from '../UserAvatar';
import { Colors } from '../../../styles/colors';
import { Button } from 'react-native-elements';
import { globalStyles } from '../../../styles/global-stylesheet';
import { Conversation } from '../../../data/queries/conversations/types';
import { useCurrentAffiliation, useCurrentUser } from '../../../redux/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConversationsStackParamList } from '../../../types/types';
import { ConversationFeedVariables } from '../../../types/interfaces';
import { FetchMoreQueryOptions, OperationVariables, useLazyQuery } from '@apollo/client';
import { ConversationsFeedResponse, ConversationsFeedPaginationResponse, GET_FEED_PAGINATION, GET_FEED } from '../../../data/queries/conversations/get-feed';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep'
import BasicAlert from '../BasicAlert';
import { ConversationPost } from './ConversationPost';
import { ConversationPlaceholder } from './Placeholder';
import { isAndroid } from '../../helpers/device';
import { ConversationsContext, ConversationsContextStructure } from '../../helpers/contexts';
import { useAffiliationYearRange } from '../../hooks';
import { useGoToConversationProfile } from '../../hooks/useGoToConversationProfile';

export const ConversationsFeedContent = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ConversationsStackParamList, '_feed'>>();
  const _flatlist = useRef<FlatList<Conversation>>();
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)

  const currentAffiliation = useCurrentAffiliation();
  const { range: yearRange, end: endYear, isStudent } = useAffiliationYearRange();
  const currentUser = useCurrentUser();
  const { schoolId, id } = currentAffiliation;
  const [ currentAffiliationId, setCurrentAffiliationId ] = useState(id);
  const { scrollEnabled, setViewableId } = useContext(ConversationsContext) as ConversationsContextStructure;
  const goToConversationProfile = useGoToConversationProfile(currentUser.personId)

  const initialVars: ConversationFeedVariables = {
    ...(isStudent ?
      { gradYear: Number(endYear) } :
      { yearRange }
    ),
    schoolId: String(schoolId),
    limit: 10,
    offset: 0
  };
  const [variables, setVariables] = useState<ConversationFeedVariables>(initialVars)

  const [queryFeed, { data, previousData, loading: isLoading, error, called, fetchMore, client }] = useLazyQuery<ConversationsFeedResponse>(GET_FEED, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    pollInterval: 60000
  });

  const [queryFeedPaginationState] = useLazyQuery<ConversationsFeedPaginationResponse>(GET_FEED_PAGINATION, {
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache'
  });

  const getFeed = _.debounce(queryFeed, 1000);
  const getFeedNextPage = _.debounce((options: FetchMoreQueryOptions<OperationVariables, ConversationsFeedResponse>) => {
    return fetchMore(options)
    .catch(error => {
      DdRum.addError(
        error.message || 'error while getting next feed page',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          error,
          options
        },
        Date.now()
      )
    })
    .finally(() => {
      setIsLoadingMore(false);
      setIsRefreshing(false);
    })
  }, 1000);

  //Clears Highlighted conversation when opening conversations feed
  const _clearHighlight = () => {
    const cache = client.cache
    const cachedFeed = cache.readQuery<ConversationsFeedResponse>({
      query: GET_FEED,
      variables: variables
    })
    if (cachedFeed) {
          // conversationsFeed is an array of conversations
          const { conversationsFeed = []} = cachedFeed;
          const newFeed = cloneDeep<Conversation[]>(conversationsFeed).map((conversation) => ({
            ...conversation,
            highlighted: false
          }));

          cache.writeQuery({
            query: GET_FEED,
            variables: variables,
            data: {
              conversationsFeed: newFeed
            }
          });
        }
  }

  useEffect(() => {
    _clearHighlight();
    doRefresh();
  }, []);

  useEffect(() => {
    if (currentAffiliation.id !== currentAffiliationId) {
      setCurrentAffiliationId(currentAffiliation.id);
      doRefresh();
    }
  }, [currentAffiliation])

  const paginate = () => {
    if (!isLoadingMore && !isLoading && canLoadMore && data?.conversationsFeed.length) {
      setIsLoadingMore(true);
      const newVariables: ConversationFeedVariables = {
        ...variables,
        lastId: data?.conversationsFeed[data.conversationsFeed.length - 1].id
      };
      setVariables(newVariables);
      getFeedNextPage({
        variables: newVariables
      });
      queryFeedPaginationState({
        variables: newVariables,
        onCompleted: (data) => {
          setCanLoadMore(data.canPaginateConversationsFeed);
        }
      });
    }
  }

  const delay = (t: number) => {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  const doRefresh = () => {
    if (currentAffiliation && currentAffiliation.id !== '') {
      setIsRefreshing(true);
      setVariables(initialVars);
      Promise.all([
        // using delay forces a minimum time
        // for the refresh. Sometimes refreshes
        // happen too fast. Making it feel like
        // nothing happenend
        delay(1000),
        getFeed({
          variables: initialVars,
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-and-network',
          onCompleted: () => {
            setIsRefreshing(false);
            setIsLoadingMore(false);
          }
        }),
        queryFeedPaginationState({
          variables: initialVars,
          onCompleted: (data) => {
            setCanLoadMore(data.canPaginateConversationsFeed);
          }
        }),
      ])
        .catch(e => console.error(e))
        .then(() => {
          setIsRefreshing(false)
        })
    }
  }

  useEffect(() => {
    if (!isLoading && !error && data) {
      setIsLoadingMore(false);
    }
    if (error) {
      BasicAlert.show({
        title: 'Conversations',
        text: (<Text style={[globalStyles.normalText, {
            fontSize: 20,
            marginTop: 20,
            color: Colors.red
          }]}
        >{error.message || 'Oops. Something went wrong. Please try again.'}</Text>)
      });
    }
  }, [isLoading, error, data, previousData]);

  const navigateToConversationPage = ({ id }: { id: string }) => {
    navigation.navigate('_conversation', { id })
  }

  const _ConversationItem = ({ conversation, key }: { conversation: Conversation; key: number }): JSX.Element => {
    return <ConversationPost
      feedVariables={variables}
      conversation={conversation}
      showFirstCommentOnly={true}
      key={key}
      onPress={() => navigateToConversationPage({ id: conversation.id })}
      focusContent={(item, node) => {
        return node.measure((x, y, width, height, px, py) => {
          _flatlist.current?.scrollToOffset({ animated: false, offset: py })
        })
      }}
    />
  }

  const _createConversation = () => {
    _flatlist.current?.scrollToOffset({ animated: false, offset: 0 })
    // we need to send initialVars as feedVariables, otherwize the newly generated
    // convo will be added to the begining of most recent feed page
    navigation.navigate('_createConversation', { feedVariables: initialVars })
  }

  const listEmptyComponent = () => {
    return (
      <View style={{ padding: 20, paddingTop: 0 }}>
        <ConversationPlaceholder />
      </View>
    )
  }

  const onViewableItemsChanged = ({
    changed
  }: {
    viewableItems: ViewToken[]
    changed: ViewToken[]
  }) => {
    const viewableItems = changed.filter((item) => item.isViewable);
    if (viewableItems.length) {
      viewableItems.forEach((item) => setViewableId(item.item.id));
    }
  };
  const viewabilityConfigCallbackPairs = useRef<ViewabilityConfigCallbackPairs>([
    {
      onViewableItemsChanged,
      viewabilityConfig: {
        itemVisiblePercentThreshold: 75,
        minimumViewTime: 500,
      }
    },
  ]);

  return (
    <KeyboardAvoidingView>
      <FlatList
        ref={_flatlist as React.Ref<FlatList<Conversation>>}
        data={data?.conversationsFeed || []}
        ListEmptyComponent={listEmptyComponent}
        renderItem={(content) => _ConversationItem({ conversation: content.item, key: content.index })}
        onEndReached={() => {
          if (!isLoading && !isRefreshing && !isLoadingMore && called && canLoadMore) {
            paginate();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl
          refreshing={isRefreshing}
          onRefresh={doRefresh}
        />}
        scrollEnabled={scrollEnabled}
        ListHeaderComponent={() => (
          <View style={{ paddingBottom: isStudent ? 0 : 20 }}>
            <AffiliationDropdown
              titleComponent={(<Text
                fontSizePreset={1}
                isBold
                textWhite
                accessibilityLabel='Affiliation Dropdown title'
                accessibilityRole='text'
                accessible={true}
              >Conversations
                <InfoCircle
                  style={{
                    marginLeft: 20
                  }}
                  onPress={() => navigation.navigate('_info')}
                />
              </Text>)}
              showSchoolName={true}
              showGradYear={true}
            />
            {Boolean(isStudent) && <View
              style={{
                padding: 20
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text
                  fontSizePreset={2}
                  isBold
                  isCentered
                  style={{ textTransform: 'uppercase' }}
                >
                  Start a new conversation with your class
                </Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                  <UserAvatar
                    user={currentUser}
                    avatarSize={50}
                    onPress={() => goToConversationProfile(currentUser.personId)}
                  />
                  <Pressable
                    onPress={_createConversation}
                    style={{ flex: 1, marginRight: 20 }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        backgroundColor: Colors.whiteRGBA(),
                        borderRadius: 25,
                        height: 43,
                        marginLeft: 20,
                        paddingHorizontal: 20,
                        width: '100%'
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>What&apos;s on your mind?</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>}
          </View>
        )}
        ListFooterComponent={() => (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            {Boolean(isLoadingMore) && (
              <ActivityIndicator
                color={Colors.cyan}
                style={{
                  width: 40,
                  height: 40
                }}
              />
            )}
            {Boolean(!canLoadMore && !isLoadingMore) && (
              <View style={{
                  paddingBottom: isAndroid() ? 120 : 60,
                  paddingHorizontal: 20,
                  width: '100%'
                }}
              >
                <View style={{
                  padding: 15,
                  borderRadius: 20,
                  backgroundColor: Colors.whiteRGBA(),
                  width: '100%'
                }}
                >
                  <Text
                    style={{
                      color: Colors.blackRGBA(),
                      fontSize: 20,
                      textAlign: 'center',
                      paddingTop: 5
                    }}
                  >
                    {'No more conversations to show.\n'}
                    <Text style={[globalStyles.boldText, {
                      fontSize: 20
                    }]}
                    >Keep the fun going!</Text>
                  </Text>
                  <Button
                    accessibilityLabel='START A CONVERSATION'
                    accessible={true}
                    accessibilityRole='button'
                    title="START A CONVERSATION"
                    titleStyle={{ fontWeight: 'bold' }}
                    type="solid"
                    containerStyle={[globalStyles.butonContainerFullWidth, { marginTop: 20 }]}
                    buttonStyle={globalStyles.buttonStyle}
                    onPress={_createConversation}
                  />
                </View>
              </View>
            )}
          </View>
        )}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </KeyboardAvoidingView>
  )
}
