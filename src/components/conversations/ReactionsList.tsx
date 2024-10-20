/* eslint-disable react/prop-types */
import { useQuery } from '@apollo/client'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Modal, PanResponder, RefreshControl, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native'
import { GET_REACTIONS, ReactionsInput, ReactionsResponse } from '../../../data/queries/conversations/reactions'
import {
  TabView,
  SceneMap,
  NavigationState,
  SceneRendererProps,
} from 'react-native-tab-view';
import { Colors } from '../../../styles/colors'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import { Reaction, ReactionPostingType, ReactionType } from '../../../data/queries/conversations/add_reaction'
import UserListItem from '../UserListItem'
import { ReactionsCount } from '../../../data/queries/conversations/types'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConversationsStackParamList } from '../../../types/types';
import { useCurrentUserId } from '../../../redux/hooks';

interface Props {
  postingId: string
  postingType: ReactionPostingType
  visible: boolean
  reactions_count: ReactionsCount
  /**
   * 0 = Likes
   * 1 = Hearts
   * 2 = Smiles
   */
  tab: number
  onClose: () => void
}

type State = NavigationState<{
  key: string
  title: string
  value: number
}>;

export const ReactionsList = ({ postingId, postingType, visible, reactions_count, tab, onClose }: Props) => {
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const currentUserId = useCurrentUserId();
  const goToProfile = (id: string) => {
    if (currentUserId === id) {
      navigation.navigate('_myProfile');
    } else {
      navigation.navigate('_fullProfile',
      {
        targetId: id
      }
      );
    }
  }
  const [ isVisible, setIsVisible ] = useState(visible);
  const [ tabIndex, setTabIndex ] = useState(tab);
  const [ likesReactions, setLikesReactions ] = useState<Reaction[]>([]);
  const [ lovesReactions, setLovesReactions ] = useState<Reaction[]>([]);
  const [ smilesReactions, setSmilesReactions ] = useState<Reaction[]>([]);

  const [ isRefreshing, setIsRefreshing ] = useState({
    likes: false,
    loves: false,
    smiles: false,
  });

  // Variables
  const variablesStartValue: ReactionsInput = {
    postingId,
    postingType,
    limit: 10,
    offset: 0,
    reactionType: ReactionType.LIKES,
  }
  const [ likesVariables, setLikesVariables ] = useState<ReactionsInput>({
    ...variablesStartValue,
    reactionType: ReactionType.LIKES,
  });

  const [ lovesVariables, setLovesVariables ] = useState<ReactionsInput>({
    ...variablesStartValue,
    reactionType: ReactionType.HEARTS,
  });

  const [ smilesVariables, setSmilesVariables ] = useState<ReactionsInput>({
    ...variablesStartValue,
    reactionType: ReactionType.SMILES,
  });

  const { data: likesData, previousData: likesPrevData, loading: likesLoading, error: likesError, refetch: likesRefetch } = useQuery<ReactionsResponse>(GET_REACTIONS, {
    variables: likesVariables,
    fetchPolicy: 'no-cache',
  });

  const { data: lovesData, previousData: lovesPrevData, loading: lovesLoading, error: lovesError, refetch: lovesRefetch } = useQuery<ReactionsResponse>(GET_REACTIONS, {
    variables: lovesVariables,
    fetchPolicy: 'no-cache',
  });

  const { data: smilesData, previousData: smilesPrevData, loading: smilesLoading, error: smilesError, refetch: smilesRefetch } = useQuery<ReactionsResponse>(GET_REACTIONS, {
    variables: smilesVariables,
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const filterReactions = (reactions: Reaction[]) => {
    const map = reactions.map((reaction, index) => {
      return {
        reaction,
        index,
        id: reaction.id
      }
    }).reduce((prev, curr) => {
      if (!prev.get(curr.id)) {
        prev.set(curr.id, curr);
      }
      return prev;
    }, new Map<string, {
      reaction: Reaction
      index: number
      id: string
    }>());
    return Array.from(map.values()).sort((a, b) => a.index - b.index).map((value) => value.reaction);
  }
  useEffect(() => {
    if (!likesLoading && likesData) {
      if (isRefreshing.likes || !likesPrevData) {
        setLikesReactions(likesData.reactionsByFilter);
        setIsRefreshing({
          ...isRefreshing,
          likes: false
        });
      } else {
        setLikesReactions(filterReactions([
          ...likesReactions,
          ...likesData.reactionsByFilter
        ]));
      }
    }
  }, [likesData, likesLoading, likesError])

  useEffect(() => {
    if (!lovesLoading && lovesData) {
      if (isRefreshing.loves || !lovesPrevData) {
        setLovesReactions(lovesData.reactionsByFilter);
        setIsRefreshing({
          ...isRefreshing,
          loves: false
        });
      } else {
        setLovesReactions(filterReactions([
          ...lovesReactions,
          ...lovesData.reactionsByFilter
        ]));
      }
    }
  }, [lovesData, lovesLoading, lovesError])

  useEffect(() => {
    if (!smilesLoading && smilesData) {
      if (isRefreshing.smiles || !smilesPrevData) {
        setSmilesReactions(smilesData.reactionsByFilter);
        setIsRefreshing({
          ...isRefreshing,
          smiles: false
        });
      } else {
        setSmilesReactions(filterReactions([
          ...smilesReactions,
          ...smilesData.reactionsByFilter
        ]));
      }
    }
  }, [smilesData, smilesLoading, smilesError])

  const pan = useRef(new Animated.ValueXY()).current;
  const _resetPositionAnim = Animated.timing(pan.y, {
    toValue: 0,
    duration: 300,
    useNativeDriver: false,
  });
  const _closeAnim = Animated.timing(pan.y, {
    toValue: Dimensions.get('screen').height,
    duration: 500,
    useNativeDriver: false,
  });

  const _panResponders = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderMove: Animated.event([
      null, { dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gs) => {
      if (gs.dy > 0 && gs.vy > 2) {
        return _closeAnim.start(onClose);
      }
      return _resetPositionAnim.start();
    },
  });

  const top = pan.y.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  const LoadingItem = () => (<UserListItem
    student={{
      firstName: '',
      lastName: '',
      nowPhoto: {
        display: {
          url: '',
          height: '0',
          width: '0'
        },
        thumbnail: {
          url: '',
          height: '0',
          width: '0'
        },
      }
    }}
    affiliation={{
      firstName: '',
      lastName: '',
      schoolName: '',
      gradYear: '',
      startYear: '',
      endYear: '',
      id: '',
      schoolId: '',
      primary: false,
      studentInfo: 1,
      role: '',
      schoolCity: '',
      schoolState: ''
    }}
    isInFlashList={false}
    containerStyle={{
      borderBottomColor: Colors.blackRGBA(0.05),
      borderBottomWidth: 1,
    }}
    isLoading={true}
  />)

  const _reaction = (reaction: Reaction) => {
    const {
        id,
        reaction_by: {
          name,
          registration_id,
          affiliation
        },
     } = reaction;
    const fullName = name.split(' ');
    const firstName = fullName[0];
    const lastName = fullName.length > 1 ? fullName[1] : '';
    return (<UserListItem
      key={`${id}`}
      student={{
        id: registration_id,
        personId: registration_id,
        firstName,
        lastName,
      }}
      affiliation={affiliation}
      isInFlashList={false}
      containerStyle={{
        borderBottomColor: Colors.blackRGBA(0.05),
        borderBottomWidth: 1,
      }}
      onPress={() => {
        goToProfile(registration_id);
        onClose();
      }}
    />)
  };

  const paginate = (origin: ReactionType) => {
    let variables: ReactionsInput;
    if (origin === ReactionType.LIKES && !likesLoading && (likesReactions.length && (likesReactions.length % 10 === 0))) {
      variables = {
        ...likesVariables,
        offset: likesVariables.offset + likesVariables.limit
      };
      likesRefetch(variables);
      setLikesVariables(variables);
    }
    if (origin === ReactionType.HEARTS && !lovesLoading && (lovesReactions.length && (lovesReactions.length % 10 === 0))) {
      variables = {
        ...lovesVariables,
        offset: lovesVariables.offset + lovesVariables.limit
      };
      lovesRefetch(variables);
      setLovesVariables(variables);
    }
    if (origin === ReactionType.SMILES && !smilesLoading && (smilesReactions.length && (smilesReactions.length % 10 === 0))) {
      variables = {
        ...smilesVariables,
        offset: smilesVariables.offset + smilesVariables.limit
      };
      smilesRefetch(variables);
      setSmilesVariables(variables);
    }
  }

  const onRefresh = (origin: ReactionType) => {
    let variables: ReactionsInput;
    if (origin === ReactionType.LIKES && !likesLoading) {
      setIsRefreshing({
        ...isRefreshing,
        likes: true
      });
      variables = {
        ...likesVariables,
        offset: 0
      };
      likesRefetch(variables);
      setLikesVariables(variables);
    }
    if (origin === ReactionType.HEARTS && !lovesLoading) {
      setIsRefreshing({
        ...isRefreshing,
        loves: true
      });
      variables = {
        ...lovesVariables,
        offset: 0
      };
      lovesRefetch(variables);
      setLovesVariables(variables);
    }
    if (origin === ReactionType.SMILES && !smilesLoading) {
      setIsRefreshing({
        ...isRefreshing,
        smiles: true
      });
      variables = {
        ...smilesVariables,
        offset: 0
      };
      smilesRefetch(variables);
      setSmilesVariables(variables);
    }
  }

  const screen = (reactionType: ReactionType) => {
    let data: Reaction[] = [];
    let refreshing = false;
    let loadingMore = false;
    switch (reactionType) {
      case ReactionType.LIKES:
        data = likesReactions;
        refreshing = isRefreshing.likes || (likesLoading && !likesPrevData)
        loadingMore = likesLoading;
        break;
      case ReactionType.HEARTS:
        data = lovesReactions;
        refreshing = isRefreshing.loves || (lovesLoading && !lovesPrevData)
        loadingMore = lovesLoading;
        break;
      case ReactionType.SMILES:
        data = smilesReactions;
        refreshing = isRefreshing.smiles || (smilesLoading && !smilesPrevData)
        loadingMore = smilesLoading;
        break;
      default:
        break;
    }
    // eslint-disable-next-line react/function-component-definition, react/display-name
    return () => (<View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: Colors.backgroundGray
      }}
    >
      <FlatList
        data={data}
        renderItem={({ item }) => _reaction(item)}
        onEndReached={() => {
          /**
           * This if is really important for avoiding unnecessary calls to the pagination function.
           * the first data.length is required because when we first load the screen we don't have any record yet
           * and the screen is empty and this was triggering the event onEndReached in an endless loop, so if
           * we don't have any data, we don't require a pagination.
           * the second element is avoiding the pagination when the amount of records is not a multiple of 10,
           * for example, we have 20 records and we reach the end of the list, it will paginate, but
           * if we have 13 records and we reach the end of the list, it will not paginate
           */
          if (data.length && data.length % 10 === 0) {
            paginate(reactionType)
          }
        }}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh(reactionType)}
          />
        }
        ListFooterComponent={() => (<View>
          {Boolean(loadingMore) && <LoadingItem />}
        </View>)}
      />
    </View>)
  };

  const renderScene = SceneMap({
    likes: screen(ReactionType.LIKES),
    love: screen(ReactionType.HEARTS),
    happy: screen(ReactionType.SMILES),
  });

  const [ routes ] = useState([
    { key: 'likes', title: `LIKES (${reactions_count.likes_count})`, value: reactions_count.likes_count },
    { key: 'love', title: `LOVE (${reactions_count.hearts_count})`, value: reactions_count.hearts_count },
    { key: 'happy', title: `HAPPY (${reactions_count.smiles_count})`, value: reactions_count.smiles_count },
  ]);
  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    return (
      <View style={styles.tabBar}>
        {
          props.navigationState.routes.map((route, i) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex) =>
                inputIndex === i ? 1 : 0.5
              ),
            });
            const getIconName = () => {
              switch (route.key) {
                case 'likes':
                  if (tabIndex === i) {
                    return 'like1';
                  }
                  return 'like2';
                case 'love':
                  if (tabIndex === i) {
                    return 'heart';
                  }
                  return 'hearto';
                case 'happy':
                  if (tabIndex === i) {
                    return 'smile-circle';
                  }
                  return 'smileo';
                default:
                  return '';
              }
            }
            const iconName = getIconName();
            return (
              <TouchableOpacity
                key={`${route.key}-${i}`}
                style={styles.tabItem}
                onPress={() => setTabIndex(i)}
                disabled={route.value === 0}
              >
                <View style={{
                  borderBottomColor: tabIndex === i ? Colors.darkCyan : Colors.ligthGray,
                  borderBottomWidth: 2,
                  width: '100%',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  height: '100%',
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                >
                  <AntDesignIcon size={20}
                    name={iconName}
                    color={Colors.darkCyan}
                    style={{
                      marginRight: 10
                    }}
                  />
                  <Animated.Text style={{ opacity, fontWeight: 'bold' }}>{route.title}</Animated.Text>
                </View>
              </TouchableOpacity>
            );
          })
        }
      </View>
    ) || null
  };

  return (<Modal
    animated
    animationType="fade"
    visible={isVisible}
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.overlay} onTouchStart={onClose}>
      <Animated.View
        onTouchStart={(event) => {
          event.preventDefault();
          event.stopPropagation();
          return;
        }}
        style={[styles.container, { top }]}
        {..._panResponders.panHandlers}
      >
        <View
          style={{
            position: 'relative',
            height: 2,
            width: '100%',
            marginBottom: 12,
          }}
        >
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          >
            <View
              style={{
                width: 60,
                borderBottomColor: Colors.gray,
                borderBottomWidth: 2,
              }}
            ></View>
          </View>
        </View>
        <TabView
          navigationState={{
            index: tabIndex,
            routes
          }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setTabIndex}
          initialLayout={{ width: 100, height: 100 }}
          swipeEnabled={false}
        />
      </Animated.View>
    </View>
  </Modal>)
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    paddingTop: 12,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    minHeight: '50%'
  },
  indicator: {
    backgroundColor: Colors.ligthCyan,
  },
  label: {
    fontWeight: '400',
    textTransform: 'capitalize'
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomColor: Colors.ligthCyan,
    borderBottomWidth: 1,
    height: 40
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
});
