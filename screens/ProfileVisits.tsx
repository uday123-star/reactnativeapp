import * as React from 'react'
import { useNavigation } from '@react-navigation/native'
import { RefreshControl, SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native'
import { Button } from '../src/components/Button'
import { globalStyles } from '../styles/global-stylesheet'
import { useAllProfileVisits, useAppDispatch, useAppSelector, useCurrentAffiliation, useCurrentUserId, useIsGoldMember } from '../redux/hooks'
import { loadMoreProfileVisitsThunk, profileVisitsThunk, refreshProfileVisitsThunk } from '../redux/slices/profile-visits/thunks'
import { closeModal, openModal, ProfileVisitModalState, ProfileVisitState } from '../redux/slices/profile-visits/slice'
import { ProfileVisitModal } from '../src/components/profile-visits/information-modal'
import { VisitReceived } from '../data/queries/profile-visits/fetch'
import { UserGBListItem } from '../src/components/profile-visits/list-item-visit'
import { ListSectionHeader } from '../src/components/profile-visits/section-header'
import { getRecentVisitsFrom } from '../redux/slices/profile-visits/helper'
import { EmptyListItem } from '../src/components/profile-visits/empty-list-item'
import { Footer } from '../src/components/profile-visits/footer'
import { RootStackParamList } from '../types/types'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Colors } from '../styles/colors'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { refetchPartialProfileThunk } from '../redux/slices/my-profile/thunks'
import { PhotoType } from '../src/rest/fileUploadService'
import { AlbumType } from '../data/queries/photos/albums'
import { PhotosFilter, PhotosVisibleState } from '../data/queries/photos/photos'
import { getClassPhotosThunk } from '../redux/slices/photos-class/thunks'
import { featureCarouselThunk } from '../redux/slices/feature-carousel/thunks'
import { PhotosAlbumsAdminModal } from '../src/components/photos'
import { AddPhotoButton } from '../src/components/AddPhotoButton'
import { useAppThunkDispatch } from '../redux/store'
import { useAffiliationYearRange, useFocusedStatus } from '../src/hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import { PhotoUploadProgressBar } from '../src/components/photos/PhotoUploadProgressBar'

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileVisits'>

export const ProfileVisitsScreen = ({ navigation, route }: Props): JSX.Element => {
  const rootNav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useFocusedStatus(navigation, route);
  const currentAffiliation = useCurrentAffiliation()
  const { end: endYear } = useAffiliationYearRange();
  const [albumsModalVisible, setAlbumsModalVisible] = React.useState(false);
  const [editAlbumId, setEditAlbumId] = React.useState('');
  const [photosModalVisible, setPhotosModalVisible] = React.useState(false);
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const { profileVisitState, namedCount, pageSize } = useAppSelector(state => state.profileVisits);
  const isGold = useIsGoldMember();
  const allProfileVisits = useAllProfileVisits();
  const hasMoreVisitsOnServer = namedCount > allProfileVisits.length;
  const isModalVisible = useAppSelector(state => state.profileVisits.profileVisitModalState === ProfileVisitModalState.isVisible);
  const { isLoading, isReloading } = ProfileVisitState;
  const currentUserId = useCurrentUserId();

  const _reload = async () => {
    thunkDispatch(refreshProfileVisitsThunk({ limit: pageSize }))
  }

  const _loadMore = () => {
    if (hasMoreVisitsOnServer) {
      const offset = allProfileVisits.length + 1;
      thunkDispatch(loadMoreProfileVisitsThunk({ limit: pageSize, offset }));
    }
  }

  const refreshPhotoCarousel = () => {
    const schoolId = currentAffiliation?.schoolId?.toString() || '';
    const year = endYear;
    const filters: PhotosFilter = {
      albumTypes: [AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
      visibleStates: [PhotosVisibleState.VISIBLE]
    };

    if (schoolId && year) {
      thunkDispatch(getClassPhotosThunk({ schoolId, year, classId: currentAffiliation.classId, filters }));
      thunkDispatch(featureCarouselThunk({ schoolId, year }));
    }
  }

  React.useEffect(() => {
    refreshPhotoCarousel();
  }, [currentAffiliation])

  React.useEffect(() => {
    thunkDispatch(profileVisitsThunk({ limit: pageSize }));
  }, [])

  React.useEffect(() => {
    if (isFocused) {
      thunkDispatch(refetchPartialProfileThunk({ id: currentUserId, type: 'BASIC' }));
    }
  }, [isFocused]);

  const _navigateToProfile = () => {
    rootNav.navigate('MyProfile', { screen: '_myProfileRoot' });
  }

  const getBlurredImageRef = (regId = ''): number => {
    return +regId.slice(-1)
  }

  const onGBListItemPress = ({ targetId }: { targetId: string }): void => {
    if (isGold) {
      return navigation.navigate('Classlist', {
        screen: '_fullProfile',
        params: { targetId }
      })
    } else {
      _openUpgradePage();
    }
  }

  const [recentVisits, oldVisits] = React.useMemo(() => getRecentVisitsFrom({ allProfileVisits }), [allProfileVisits]);

  const recentVisitHeader = () => {
    return {
      jsx: (<ListSectionHeader
        title="Recent Visits"
        count={String(recentVisits.length || 0)}
        showInfoCircle={true}
        onPressInfoCircle={() => dispatch(openModal())}
      />),
      id: 'recent-visit-header',
    }
  }

  const oldVisitHeader = () => {
    return {
      jsx: (<ListSectionHeader
        title="Previous Visits"
        count={String(oldVisits.length || 0)}
        showInfoCircle={false}
      />),
      id: 'other-visits-header',
    }
  }

  const convertVisitsToListableItems = (profileVisits: VisitReceived[], extraStyles = {}): RenderItems[] => {
    return profileVisits.map(visit => ({
      jsx: (<UserGBListItem student={visit}
        containerStyle={{ marginBottom: 5, ...extraStyles }}
        isGold={isGold}
        blurredImageRef={getBlurredImageRef(visit.visitorId)}
        onPress={() => onGBListItemPress({ targetId: visit.visitorId })}
      />),
      id: String(visit.id)
    }))
  }

  let recentVisitsSection: RenderItems[] = [];
  let oldVisitsSection: RenderItems[] = [];

  if (recentVisits.length) {
    // DO NOT use array push or pop in react native, unless you like strange bugs that are difficult to troubleshoot !
    recentVisitsSection = [recentVisitHeader(), ...convertVisitsToListableItems(recentVisits, { ...styles.highlightedListItem })];
  }

  if (oldVisits.length) {
    // DO NOT use array push or pop in react native, unless you like strange bugs that are difficult to troubleshoot !
    oldVisitsSection = [oldVisitHeader(), ...convertVisitsToListableItems(oldVisits)];
  }

  // let listItems: RenderItems[] = [oldVisitHeader(), ...convertVisitsToListableItems(oldVisits)];
  const listItems = [...recentVisitsSection, ...oldVisitsSection];

  const _openUpgradePage = () => {
    navigation.navigate('_upgrade')
  }

  const _renderItem = ({ item }: { item: RenderItems }) => {
    return (item.jsx);
  }

  const _emptyItem = () => {
    return <EmptyListItem navigation={navigation} />
  }

  const _footer = () => {
    return <Footer />
  }

  if (!isGold) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[globalStyles.primarySectionColor, { paddingVertical: 20 }]}>
          <Text style={[styles.profileVisitText, { fontWeight: 'bold', fontSize: 24 }]}>
            My Profile Visits
          </Text>
        </View>

        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, margin: 10, paddingHorizontal: 20, justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center', padding: 20, fontSize: 24, color: Colors.darkCyan, fontWeight: 'bold' }}>
            This feature is not available in our app, but you can check it out on the website.
          </Text>

          <Text style={{ textAlign: 'center', padding: 10, fontSize: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>In the meantime update your profile</Text> to make sure your schoolmates know what you&apos;re up to!
          </Text>

          <View>
            <AddPhotoButton
              containerStyle={{ ...globalStyles.butonContainerPartialWidth, marginBottom: 20 }}
              onPress={() => setAlbumsModalVisible(true)}
            />
            <Text
              style={{ color: Colors.darkCyan, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
              onPress={_navigateToProfile}
            >
              VIEW MY PROFILE
            </Text>
          </View>
        </View>
        {
          <PhotosAlbumsAdminModal
            photosModalVisible={photosModalVisible}
            onClosePhotos={() => setPhotosModalVisible(false)}
            onSuccessPhotos={() => {
              setPhotosModalVisible(false);
              refreshPhotoCarousel();
            }}
            onErrorPhotos={() => {
              setPhotosModalVisible(false);
            }}
            photoType={PhotoType.PHOTO_ALBUM_TYPE}
            editAlbumId={editAlbumId}
            albumsModalVisible={albumsModalVisible}
            currentAffiliation={currentAffiliation}
            onCloseAlbums={() => setAlbumsModalVisible(false)}
            onSuccessAlbums={(albumId) => {
              setEditAlbumId(albumId);
              setAlbumsModalVisible(false);
              setPhotosModalVisible(true);
            }}
            classId={currentAffiliation.classId || ''}
          />
        }
        <PhotoUploadProgressBar />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={[globalStyles.primarySectionColor, { paddingBottom: 10 }]}>
        <Text style={styles.profileVisitHeaderText}>My Profile Visits</Text>
        <Text style={styles.profileVisitText}>
          You have
          <Text style={{ fontWeight: 'bold' }}> {namedCount || 0} total </Text>
          visits to your profile
        </Text>

        {(!isGold && namedCount !== 0) &&
          <Button
            title="UPGRADE TO SEE WHO VISITED YOU"
            style={[globalStyles.buttonTransparent, { backgroundColor: Colors.blackRGBA() }]}
            onPress={_openUpgradePage}
            isPartialWidth={true}
            backgroundColor={Colors.blackRGBA()}
            textColor={Colors.whiteRGBA()}
            borderRadius={25}
            accessibilityLabel='upgrade to see who visited you'
            accessible={true} 
          />
        }
      </View>
      {
        profileVisitState === isLoading
          ?
          (
            <ScreenLoadingIndicator />
          )
          :
          (<FlatList
            style={[styles.profileVisitList]}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={profileVisitState === isReloading} onRefresh={_reload} />}
            data={listItems}
            renderItem={_renderItem}
            ListEmptyComponent={_emptyItem}
            ListFooterComponent={_footer}
            keyExtractor={(item) => item.id}
            onEndReachedThreshold={0}
            onEndReached={_loadMore}
          />)
      }
      <ProfileVisitModal
        isVisible={isModalVisible}
        closeModal={() => dispatch(closeModal())}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileVisitList: {
    flex: 1,
    marginTop: 5,
    marginHorizontal: 10
  },
  profileVisitHeaderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  profileVisitText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  highlightedListItem: {
    backgroundColor: '#BDE1E2'
  }
});

interface RenderItems {
  jsx: JSX.Element
  id: string
}


