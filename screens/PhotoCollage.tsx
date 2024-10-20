import React, { useEffect, useMemo, useState } from 'react'
import { LayoutChangeEvent, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { PhotoCollageParams, PhotosStackParamList } from '../types/types'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AffiliationDropdown } from '../src/components/AffiliationDropdown'
import { useCurrentAffiliation, useCurrentUserId } from '../redux/hooks'
import { PhotosCarousel } from '../src/components/carousels/photos'
import { useQuery, WatchQueryFetchPolicy } from '@apollo/client'
import { GetPhotosAlbumsResponse, GET_PHOTOS_MULTIPURPOSE, PhotosFilter, PhotosVisibleState } from '../data/queries/photos/photos'
import { GET_PEOPLE, PeopleResponse } from '../data/queries/people/person-data'
import { Colors } from '../styles/colors'
import { globalStyles } from '../styles/global-stylesheet'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { AlbumType } from '../data/queries/photos/albums'
import { refetchPartialProfileThunk } from '../redux/slices/my-profile/thunks'
import { EmptyAlbum } from '../src/components/photos/EmptyAlbum'
import { PhotosAlbumsAdminModal } from '../src/components/photos'
import { PhotoType } from '../src/rest/fileUploadService'
import { Card } from 'react-native-elements'
import { useFocusedStatus } from '../src/hooks/onFocus'
import { useAppThunkDispatch } from '../redux/store'
import { PhotoUploadProgressBar } from '../src/components/photos/PhotoUploadProgressBar'
import { useAffiliationYearRange } from '../src/hooks'

type Props = NativeStackScreenProps<PhotosStackParamList, '_photoCollage'>

enum ComponentState {
  isLoading,
  isRefreshing,
  hasData,
  isEmpty,
  hasError
}

export const PhotoCollageScreen = ({ navigation, route }: Props): JSX.Element => {
  const isFocused = useFocusedStatus(navigation, route);
  const { params } = route
  const personId = params.personId

  const { isLoading, isRefreshing, hasData, isEmpty, hasError } = ComponentState
  const [componentState, setComponentState] = useState(isLoading)
  const [carouselWidth, setCarouselWidth] = useState(0)
  const [personsName, setPersonsName] = useState('')
  const fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network';

  const [ photosModalVisible, setPhotosModalVisible ] = useState(false);
  const [ editAlbumId, setEditAlbumId ] = useState('');
  const [ albumsModalVisible, setAlbumsModalVisible ] = useState(false);
  const currentAffiliation = useCurrentAffiliation();

  const currentUserId = useCurrentUserId()
  const thunkDispatch = useAppThunkDispatch()
  const { end: endYear, isStudent } = useAffiliationYearRange();

  const filters: PhotosFilter = {
    albumTypes: [AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
    visibleStates: [PhotosVisibleState.VISIBLE],
  }

  const queryVariables: PhotoCollageParams = useMemo(() => {
    if (isStudent && params.schoolId) {
      return {
        year: endYear,
        schoolId: params.schoolId,
        classId: currentAffiliation.classId,
        filters,
        limit: 100,
        offset: 0,
      };
    }
    return params;
  }, [currentAffiliation, isStudent]);

  const { data: albumData, loading: loadingAlbumData, error, refetch } = useQuery<GetPhotosAlbumsResponse>(GET_PHOTOS_MULTIPURPOSE, {
    variables: queryVariables,
    fetchPolicy
  });

  const { data: personData, loading: loadingPersonData } = personId ? useQuery<PeopleResponse>(GET_PEOPLE, {
    variables: {
      personId
    },
    fetchPolicy
  }) : { data: null, loading: false };

  useEffect(() => {
    if (isFocused) {
      thunkDispatch(refetchPartialProfileThunk({ id: currentUserId, type: 'BASIC' }));
    }
  }, [isFocused]);

  useEffect(() => {
    const hasAlbums = !!albumData && !!albumData.photos.photos.length
    // const hasAlbums = !!albumData && !!albumData?.photos?.photos?.length
    const hasPerson = !!personData
    const isForcedRefresh = componentState === isRefreshing

    if (loadingAlbumData || loadingPersonData || isForcedRefresh) {
      return setComponentState(isLoading)
    }

    if (hasPerson) {
      const { firstName, lastName } = personData.people[0]
      setPersonsName(`${firstName} ${lastName}`)
    }

    if (hasAlbums) {
      return setComponentState(hasData)
    }

    if (error) {
      return setComponentState(hasError)
    }

    return setComponentState(isEmpty)

  }, [albumData, personData, loadingAlbumData, loadingPersonData, componentState, error])

  const _navigationToCarousel = (photoId: string) => {
    if (albumData && albumData.photos.photos) {
      navigation.navigate('_photoCarousel',
        {
          photoId,
          type: 'multipurpose',
          variables: queryVariables
        }
      );
    }
  }

  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  const onRefresh = () => {
    setComponentState(isRefreshing);
    refetch({
      ...queryVariables,
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={componentState === isRefreshing} onRefresh={onRefresh} />}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <View style={{ flexGrow: 1 }}>
          {
            Boolean(!personId && isStudent) && <AffiliationDropdown
              showSchoolName={true}
              showSchoolLocation={true}
              onChange={(affiliation) => {
                if (affiliation.role !== 'STUDENT') {
                  navigation.goBack();
                }
              }}
            />
          }
          <View style={{ flexGrow: 1, position: 'relative' }}>
            {componentState === isLoading &&
              <View style={styles.growContainer}>
                <ScreenLoadingIndicator />
              </View>
            }
            {componentState === hasData &&
              <View style={{ flexGrow: 1 }}>
                {Boolean(personData) && (
                  <View style={{ backgroundColor: Colors.darkCyan, padding: 20 }}>
                    <Text style={[globalStyles.boldText, styles.largeWhiteText]}>
                      {`${personsName}'s photos`}
                    </Text>
                  </View>
                )}

                <View style={{ flexGrow: 1, padding: 10 }}>
                  <View onLayout={getPhotoCarouselWidth}
                    style={{ flexGrow: 1 }}
                  >
                    {Boolean(albumData) && (
                      <PhotosCarousel
                        photos={albumData?.photos?.photos || []}
                        width={carouselWidth}
                        staticContent={true}
                        rowElements={2}
                        multiRow={true}
                        masonryList={true}
                        firstItem={0}
                        onPress={(photoId) => {
                          _navigationToCarousel(photoId)
                        }}
                      />
                    )}
                  </View>
                </View>
              </View>
            }

            {componentState === isEmpty &&
              <View style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              >
                <Card
                  containerStyle={{
                    width: '90%',
                    height: '90%',
                    borderRadius: 10,
                    margin: 0
                  }}
                >
                  <EmptyAlbum
                    onPress={() => setAlbumsModalVisible(true)}
                    useGrowContainer={true}
                  />
                </Card>
              </View>
            }

            {componentState === hasError &&
              <View style={styles.growContainer}>
                <Text>Oops, something went wrong. Please try again.</Text>
              </View>
            }
          </View>
        </View>
      </ScrollView>
      <PhotosAlbumsAdminModal
        photosModalVisible={photosModalVisible}
        onClosePhotos={() => setPhotosModalVisible(false)}
        onSuccessPhotos={() => {
          setPhotosModalVisible(false);
          onRefresh();
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
      <PhotoUploadProgressBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  growContainer: {
    flexGrow: 1,
    backgroundColor: Colors.whiteRGBA(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  largeWhiteText: {
    color: Colors.whiteRGBA(),
    textAlign: 'center',
    fontSize: 22
  }
})
