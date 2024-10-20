import React, { useEffect } from 'react'
import { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, RefreshControl } from 'react-native'
import { Text } from '../src/components/Text'
import { Button } from '../src/components/Button'
import { useCurrentUserId } from '../redux/hooks'
import { globalStyles } from '../styles/global-stylesheet'
import { DividerLine } from '../src/components/DividerLine'
import { FeaturedSection } from '../src/components/my-profile/FeaturedSection'
import GuestbookVisitBar from '../src/components/guestbook/carousel-visit-bar'
import { ScreenWidth } from '@freakycoder/react-native-helpers'
import { MyProfileModal } from '../src/components/my-profile/Modal'
import { MyAffiliationSection } from '../src/components/my-profile/MyAffiliationSection'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MyProfileStackParamList } from '../types/types'
import { MyStorySection } from '../src/components/my-profile/MyStorySection'
import { BioOptOutSection } from '../src/components/my-profile/BioOptOutSection'
import { BirthDateSection } from '../src/components/my-profile/BirthDateSection'
import { MyLocationSection } from '../src/components/my-profile/MyLocationSection'
import { PhotosCarousel } from '../src/components/carousels/photos'
import { ViewAll } from '../src/components/carousels/photos/ViewAll'
import { PhotoType } from '../src/rest/fileUploadService'
import { useQuery } from '@apollo/client'
import { PhotosAlbumsAdminModal } from '../src/components/photos'
import { TabNames } from '../src/components/photos/AlbumsAdminModal'
import { AddPhotoButton } from '../src/components/AddPhotoButton'
import { useFocusedStatus } from '../src/hooks'
import { FetchMyProfileResponse, FETCH_MY_PROFILE } from '../data/queries/my-profile/fetch'
import { PhotoUploadProgressBar } from '../src/components/photos/PhotoUploadProgressBar'
import { useConfiguration } from '../src/hooks'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { VisiteesByOrigin } from '../src/hooks/useVisiteeIdByOrigin'
type Props = NativeStackScreenProps<MyProfileStackParamList, '_myProfileRoot'>

export const MyProfileScreen = ({ navigation, route }: Props): JSX.Element | null => {
  useFocusedStatus(navigation, route);
  const { features: { isProfileVisitsEnabled }} = useConfiguration();
  const currentUserId = useCurrentUserId();
  const [ photosModalVisible, setPhotosModalVisible ] = useState(false);
  const [ albumsModalVisible, setAlbumsModalVisible ] = useState(false);
  const [ editAlbumId, setEditAlbumId ] = useState('');
  const [ uploadPhotoType, setUploadPhotoType ] = useState<PhotoType>(PhotoType.PHOTO_ALBUM_TYPE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: profileData, loading: profileLoading, error: profileError, refetch } = useQuery<FetchMyProfileResponse>(FETCH_MY_PROFILE, {
    variables: {
      id: currentUserId
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:profile:people`]: currentUserId
    })
    return () => {
      const visitees = VisiteesByOrigin();
      delete visitees[`${route.name}:profile:people`];
      VisiteesByOrigin(visitees)
    }
  }, [])

  const doRefresh = () => {
    setIsRefreshing(true);
    refetch().catch(error => { DdRum.addError
      error.message || 'an error occurred while fetching studentInfo',
      ErrorSource.SOURCE,
      error.stack || __filename,
      {
        queryVariables: {
          id: currentUserId
        },
      error: {
        error
      }
      }
    }
    ).finally(() => setIsRefreshing(false));
  }

  const _navigateToCollage = () => {
    navigation.navigate('_photoCollage', {
      personId: currentUserId,
      limit: 100,
      offset: 0,
    });
  }

  const _seeWhoVisited = () => {
    navigation.getParent()?.navigate('ProfileVisits');
  }

  const _navigateToCarousel = (photoId: string) => {
    navigation?.navigate('_photoCarousel', {
      photoId,
      type: 'my-profile',
      variables: {
        id: currentUserId
      }
    });
  }

  const uploadProfilePhoto = (type: 'NOW'|'THEN') => {
    setPhotosModalVisible(true);
    setEditAlbumId('');
    setUploadPhotoType(type === 'NOW' ? PhotoType.NOW_PHOTO : PhotoType.THEN_PHOTO);
  }

  if (profileError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Oops! We are having some issues loading your profile, please try again later.</Text>
      </View>
    )
  }

  if (profileLoading && !isRefreshing) {
    return (
      <ScreenLoadingIndicator />
    )
  }

  if (profileData) {
    const currentUser = profileData.people[0];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={doRefresh} />}
          scrollIndicatorInsets={{ right: 1 }}
        >
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            margin: 10, }}
          >
            {/* My Profile Featured Section */}
            <FeaturedSection
              photoUrl={currentUser.nowPhoto?.display?.url || null}
              thenPhotoUrl={currentUser.thenPhoto?.display?.url || null}
              firstName={currentUser.firstName}
              lastName={currentUser.lastName}
              creationDate={new Date(String(currentUser.creationDate))}
              schoolName={currentUser.primaryAffiliation?.schoolName || 'error'}
              endYear={currentUser.primaryAffiliation?.gradYear || currentUser.primaryAffiliation?.endYear || 'error'}
              startYear={currentUser.primaryAffiliation?.startYear || 'error'}
              isStudent={currentUser.primaryAffiliation?.role === 'STUDENT'}
              onUploadPhoto={uploadProfilePhoto}
            />
            <GuestbookVisitBar
              student={currentUser}
              visitOrigin='profile:people'
            />
            {Boolean(isProfileVisitsEnabled) &&
              <Button
                title="SEE WHO VISITED YOU"
                onPress={_seeWhoVisited} 
                accessibilityLabel={'see who visited you'} 
                accessible={false}              
              />
            }
            <DividerLine />

            {/* Photos */}
            <PhotosCarousel
              photos={currentUser.photos || []}
              width={ScreenWidth * 0.85}
              staticContent={true}
              rowElements={4}
              onPress={(photoId) => {
                _navigateToCarousel(photoId)
              }}
              callToAction={(index, size, margin) => <ViewAll index={index}
                size={size}
                margin={margin}
                onPress={() => _navigateToCollage()}
              />}
              firstItem={0}
            />
            <AddPhotoButton
              containerStyle={{ marginTop: 10 }}
              onPress={() => setAlbumsModalVisible(true)}
            />
            <DividerLine />

            {/* Story */}
            <MyStorySection currentUser={currentUser} />
            <BirthDateSection
              navigation={navigation.getParent()}
              currentUser={currentUser}
            />
            <MyLocationSection
              navigation={navigation.getParent()}
              route={route}
              currentUser={currentUser}
            />
            <BioOptOutSection currentUser={currentUser} />
            <DividerLine />

            {/* Affiliations */}
            <Text style={globalStyles.sectionHeaderText}>Schools</Text>

            {
              currentUser?.affiliations.map((affiliation, index) => (
                <View key={index}>
                  {index !== 0 && <DividerLine />}
                  <MyAffiliationSection
                    affiliation={affiliation}
                    onUpdate={doRefresh}
                  />
                </View>
              ))
            }
          </View>
        </ScrollView>
        <MyProfileModal />
        {
          <PhotosAlbumsAdminModal
            photosModalVisible={photosModalVisible}
            onClosePhotos={() => {
              setPhotosModalVisible(false);
              setUploadPhotoType(PhotoType.PHOTO_ALBUM_TYPE);
            }}
            onSuccessPhotos={() => {
              setPhotosModalVisible(false);
              setUploadPhotoType(PhotoType.PHOTO_ALBUM_TYPE);
              doRefresh();
            }}
            onErrorPhotos={() => {
              setPhotosModalVisible(false);
              setUploadPhotoType(PhotoType.PHOTO_ALBUM_TYPE);
            }}
            photoType={uploadPhotoType}
            editAlbumId={editAlbumId}
            albumsModalVisible={albumsModalVisible}
            albumsTabIndex={TabNames.PERSON}
            showAlbumTabs={false}
            onCloseAlbums={() => setAlbumsModalVisible(false)}
            onSuccessAlbums={(albumId) => {
              setEditAlbumId(albumId);
              setAlbumsModalVisible(false);
              setPhotosModalVisible(true);
            }}
          />
        }
        <PhotoUploadProgressBar />
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonSpacing: {
    marginBottom: 20,
  }
});
