import { useMutation, useQuery } from '@apollo/client'
import React, { useMemo, useRef, useState } from 'react'
import { StyleSheet, View, RefreshControl, Text, FlatList } from 'react-native'
import { BlockedUsersResponse, GET_BLOCK_LIST, UNBLOCK_PROFILE } from '../data/queries/security/block'
import { useCurrentAffiliation, useCurrentUserId } from '../redux/hooks'
import { globalStyles } from '../styles/global-stylesheet'
import { Colors } from '../styles/colors'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { BlockedUserLineItem, OnToggleSwitch } from '../src/components/BlockedUsers/BlockedUserLineItem'
import { UnblockUserConfirmationBox } from '../src/components/BlockedUsers/UnblockUserConfirmationBox'
import { setBlockState } from '../src/hooks'
import { NEW_STUDENTS } from '../data/queries/students/students'
import { GET_CONVERSATIONS_ACTIVITY } from '../data/queries/conversations/activity'
import { LOAD_CAROUSEL } from '../data/queries/people/feature-carousel'
import { GET_PHOTOS } from '../data/queries/photos/get-featured-photos'
import { AlbumType } from '../data/queries/photos/albums'
import { PhotosVisibleState } from '../data/queries/photos/photos'
import { BlockedStudents, shouldRefreshNewMembersModule } from '../src/adapters/apollo-client.adapter'

export const BlockedUsersScreen = (): JSX.Element => {
  const currentUserId = useCurrentUserId()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false)
  const [resetSwitchesSignal, setCancelledUnblockSignal] = useState(0)
  const { id: currentAffiliationId, schoolId, gradYear, classId } = useCurrentAffiliation();
  const personToUnblock = useRef({
    personId: '',
    itemId: ''
  });

  const { data: blockedUsers, loading: isLoading, refetch: refetchBlockedUsers } = useQuery<BlockedUsersResponse>(GET_BLOCK_LIST, {
    variables: {
      personId: currentUserId
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  // useMemo prevents flash of underived state
  // while toggling switches
  const reversedBlockedList = useMemo(() => {
    if (blockedUsers?.blacklist?.blockedList) {
      const arr = blockedUsers.blacklist.blockedList.filter(record => record.person)
      return arr.reverse();
    }
    return []
  }, [blockedUsers?.blacklist?.blockedList])

  const [_unblockProfile] = useMutation(UNBLOCK_PROFILE, { fetchPolicy: 'network-only' });

  const _emptyItem = () => {
    return <View>
      <Text
        accessibilityLabel='You do not have any blocked profiles yet'
        accessibilityRole='text'
        style={styles.emptyListText}
      >
        You don&apos;t have any blocked profiles yet.
      </Text>
    </View>
  }

  const doUnblockProfile = () => {
    if (!personToUnblock.current) {
      throw new Error('cannot unblock user, personId not set')
    }

    setIsBlockModalVisible(false)
    const refetchQueries = [
      {
        query: NEW_STUDENTS,
        variables: {
          affiliationId: String(currentAffiliationId),
          limit: 3,
          offset: 0
        }
      },
      {
        query: GET_CONVERSATIONS_ACTIVITY,
        variables: {
          authorId: currentUserId,
          gradYear: Number(gradYear),
          schoolId,
          limit: 4
        }
      },
      {
        query: LOAD_CAROUSEL,
        variables: {
          year: String(gradYear),
          schoolId: String(schoolId),
        }
      },
      {
        query: GET_PHOTOS,
        variables: {
          schoolId,
          year: gradYear,
          classId,
          filters: {
            albumTypes: [ AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
            visibleStates: [PhotosVisibleState.VISIBLE]
          },
        }
      }
    ];
    _unblockProfile({
      variables: {
        personId: personToUnblock.current.personId
      },
      onCompleted() {
        doRefresh(false);
        setBlockState({
          action: 'unblock',
          personId: personToUnblock.current.personId
        });
      },
      onError(error) {
        DdRum.addError(
          error.message || 'error while unblocking profile',
          ErrorSource.SOURCE,
          error.stack || __filename,
          {
            error,
            personId: personToUnblock.current.personId
          },
          Date.now()
        )
      },
      refetchQueries,
      update: (cache) => {
        const cachedBlockedProfile = cache.identify({
          __typename: 'BlockedProfiles',
          id: personToUnblock.current.itemId
        });
        cache.modify({
          id: cachedBlockedProfile,
          fields: (record, { DELETE }) => {
            return DELETE;
          }
        });
        const cachedPerson = cache.identify({
          __typename: 'Person',
          id: personToUnblock.current.personId
        });
        cache.modify({
          id: cachedPerson,
          fields: {
            isBlocked: () => false
          }
        });
        const studentId = BlockedStudents().find(id => id === personToUnblock.current.personId);
        if (studentId) {
          BlockedStudents(BlockedStudents().filter(id => id !== personToUnblock.current.personId))
        } else {
          shouldRefreshNewMembersModule(true);
        }
      }
    })
  }

  const doRefresh = async (refetch = true) => {
    setIsRefreshing(true)
    if (refetch) {
      await refetchBlockedUsers()
    }

    // after we reload, we need to send a signal to
    // all render item components, so they
    // can reset their switches to on.
    // This lets the user know that anything in the list
    // is still blocked
    setCancelledUnblockSignal(prev => prev + 1)
    setIsRefreshing(false)
  }

  const onCloseConfirmationBox = async () => {
    setIsBlockModalVisible(false)
    await doRefresh()
  }

  if (isLoading) {
    return (
      <ScreenLoadingIndicator />
    )
  }

  if (reversedBlockedList) {
    const onToggleSwitch = ({ isEnabled, person, item }: OnToggleSwitch) => {
      if (isEnabled) {
        if (!person?.personId) {
          throw new Error('Cannot unblock user, no personId provided')
        }

        personToUnblock.current = {
          personId: person?.personId,
          itemId: item._id
        };
        setIsBlockModalVisible(true)
      }
    }

    return (
      <View style={styles.profileVisitList}>
        <FlatList
          style={{ flex: 1, backgroundColor: Colors.whiteRGBA(), margin: 10, borderRadius: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={doRefresh} />}
          data={reversedBlockedList}
          renderItem={({ item }) => <BlockedUserLineItem
            item={item}
            onToggleSwitch={onToggleSwitch}
            resetSwitchesSignal={resetSwitchesSignal}
          />}
          ListEmptyComponent={_emptyItem}
          onEndReachedThreshold={0}
          scrollIndicatorInsets={{ right: 1 }}
        />
        <UnblockUserConfirmationBox
          doConfirmed={doUnblockProfile}
          onCloseConfirmationBox={onCloseConfirmationBox}
          isBlockModalVisible={isBlockModalVisible}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={[globalStyles.errorText, { fontSize: 20, fontWeight: 'bold' }]}>Oops!</Text>
      <Text style={globalStyles.errorText}>There was an error when attempting to load a list of users. Please go back, and try again later.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  profileVisitList: {
    flex: 1,
    marginTop: 5,
    marginHorizontal: 0
  },
  emptyListText: {
    color: Colors.blackRGBA(),
    textAlign: 'center',
    fontSize: 20,
    padding: 20,
  }
});
