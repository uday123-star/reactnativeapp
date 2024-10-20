import React, { useEffect, useState } from 'react';
import { BaseModule } from './Base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-elements';
import { Button } from '../Button';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';
import { Image, LayoutChangeEvent, StyleSheet, TouchableHighlight, View } from 'react-native';
import { EmptyAlbum } from '../photos/EmptyAlbum';
import UserListItem from '../UserListItem';
import { PhotosCarousel } from '../carousels/photos';
import { AddPhotoButton } from '../AddPhotoButton';
import { useCurrentAffiliation, useCurrentUserId } from '../../../redux/hooks';
import { GET_PHOTOS_MULTIPURPOSE, PhotosFilter, PhotosVisibleState } from '../../../data/queries/photos/photos';
import { AlbumType } from '../../../data/queries/photos/albums';
import { useQuery } from '@apollo/client';
import { GetPhotoResponse, GET_PHOTOS } from '../../../data/queries/photos/get-featured-photos';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/types';
import { ScreenWidth } from '@freakycoder/react-native-helpers';
import { globalStyles } from '../../../styles/global-stylesheet';
import { PhotosAlbumsAdminModal } from '../photos';
import { PhotoType } from '../../rest/fileUploadService';
import { getSessionData } from '../../helpers/session';
import { useAffiliationYearRange } from '../../hooks';

export const FeaturedPhotosModule = () => {
  const navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> = useNavigation();
  const currentAffiliation = useCurrentAffiliation();
  const { range: yearRange,end: endYear, isStudent } = useAffiliationYearRange();
  const currentUserId = useCurrentUserId();
  const focused = useIsFocused();

  const [ albumsModalVisible, setAlbumsModalVisible ] = useState(false);
  const [ photosModalVisible, setPhotosModalVisible ] = useState(false);
  const [ carouselWidth, setCarouselWidth] = useState(0);
  const [ editAlbumId, setEditAlbumId ] = useState('');

  const { schoolId, classId } = currentAffiliation;
  const filters: PhotosFilter = {
    albumTypes: [ AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
    visibleStates: [PhotosVisibleState.VISIBLE]
  };
  const variables = {
    schoolId,
    year: isStudent ? endYear : yearRange,
    classId: isStudent ? classId : undefined,
    filters,
  };
  const { data, loading, refetch, startPolling, stopPolling } = useQuery<GetPhotoResponse>(isStudent ? GET_PHOTOS : GET_PHOTOS_MULTIPURPOSE, {
    variables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    onError: (error) => {
      const session = getSessionData();
      DdRum.addError('Loading New Members Module', ErrorSource.SOURCE, error.message || 'Error fetching students info', {
        variables,
        session
      }, Date.now())
    }
  });

  useEffect(() => {
    return () => {
      stopPolling();
    }
  }, []);

  useEffect(() => {
    if (focused) {
      startPolling(120000);
    } else {
      stopPolling();
    }
  }, [focused]);

  const _navigateToProfile = (targetId: string) => {
    if (targetId === currentUserId) {
      navigation.navigate('MyProfile', { screen: '_myProfileRoot' })
      return;
    }
    navigation.navigate('Classlist',
      {
        screen: '_fullProfile',
        params: {
          targetId
        }
      }
    );
  }
  const _navigationToCarousel = (photoId: string) => {
    // setImageIndex(index);
    navigation.navigate('Photos',
      {
        screen: '_photoCarousel',
        params: {
          photoId,
          type: isStudent ? 'new-photos' : 'multipurpose',
          variables
        }
      }
    );
  }
  const _navigateToCollage = () => {
    const filters: PhotosFilter = {
      albumTypes: [ AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
      visibleStates: [PhotosVisibleState.VISIBLE]
    };
    navigation.navigate('Photos', {
      screen: '_photoCollage',
      params: {
        schoolId,
        year: endYear,
        classId,
        filters,
        limit: 100,
        offset: 0,
      }
    });
  }
  const _navigateToAllMyPhotos = () => {
    const filters: PhotosFilter = {
      albumTypes: [ AlbumType.ALL ],
    };
    navigation.navigate('Photos', {
      screen: '_photoCollage',
      params: {
        personId: currentUserId,
        filters,
        limit: 100,
        offset: 0,
      }
    });
  }
  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  const photosLength = (data?.photos.photos.length || 0);
  const featuredPhoto = data?.photos.photos[0];

  return (
    <BaseModule
      icon={<Icon.Button name='camera'
        size={28}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: -7, marginRight: 0 }}
      />}
      heading="Featured Photo"
    >
      <Card>
        {// loading state
          Boolean(loading) &&
          <Placeholder
            Animation={Fade}
          >
            <View style={{ height: 160, borderWidth: 3, borderColor: '#EEE' }}>
              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                <View style={{ marginVertical: 15 }}>
                  <PlaceholderMedia />
                </View>
                <PlaceholderLine width={50} />
                <PlaceholderLine width={50} />
              </View>
            </View>
          </Placeholder>
        }

        {// empty list state
          (photosLength === 0) &&
          <EmptyAlbum
            onPress={() => setAlbumsModalVisible(true)}
          />
        }

        {// hasResults state
          (photosLength !== 0) &&
          <View style={{}}>
            <UserListItem student={featuredPhoto?.createdByPerson}
              accessibilityLabel='Featured Photo Profile'
              affiliation={currentAffiliation}
              containerStyle={{ marginTop: -10 }}
              onPress={() => _navigateToProfile(featuredPhoto?.createdByPerson?.personId || '')}
            />
          </View>
        }

        {
          Boolean(photosLength !== 0 && (+(featuredPhoto?.display?.width || 0) >= ScreenWidth || +(featuredPhoto?.display?.height || 0) >= 300)) &&
          <TouchableHighlight underlayColor='transparent'
            onPress={() => {
              _navigationToCarousel(featuredPhoto?.id || '');
            }}
            accessibilityLabel='Open Featured Photo'
            accessible={true}
            accessibilityRole='imagebutton'
          >
            <Image
              accessibilityLabel='Featured Photo'
              accessible={true}
              accessibilityRole='image'
              source={{ uri: featuredPhoto?.display?.url }}
              style={{ height: 300, marginBottom: 15 }}
            />
          </TouchableHighlight>
        }

        {// image smaller than space => show full image
          Boolean(photosLength !== 0 && +(featuredPhoto?.display?.width || 0) < ScreenWidth && +(featuredPhoto?.display?.height || 0) < 300) &&
          <TouchableHighlight underlayColor='transparent'
            onPress={() => {
              _navigationToCarousel(featuredPhoto?.id || '');
            }}
            accessibilityLabel='Open Featured Photo'
            accessible={true}
            accessibilityRole='imagebutton'
          >
            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
              <Image
                accessibilityLabel='Featured Photo'
                accessible={true}
                accessibilityRole='image'
                source={{ uri: featuredPhoto?.display?.url }}
                style={{ width: +(featuredPhoto?.display?.width || 0), height: +(featuredPhoto?.display?.height || 0), marginBottom: 15 }}
              />
            </View>
          </TouchableHighlight>
        }

        {/** PHOTOS CAROUSEL */}
        {// what do we do if we only have one featured photo but there are no photos for carousel
          photosLength !== 0 &&
          <View>
            {
              (photosLength > 1) && <View>
                <Card.Title style={{ textAlign: 'left' }}>NEW PHOTOS FROM THE CLASS OF &apos;{endYear.slice(2)}</Card.Title>

                <View style={{ flex: 1, marginLeft: 0, marginTop: 0, marginBottom: 20 }} onLayout={getPhotoCarouselWidth}>
                  <PhotosCarousel
                    photos={data?.photos.photos || []}
                    width={carouselWidth}
                    firstItem={0}
                    excludeIds={featuredPhoto ? [featuredPhoto.id] : []}
                    onPress={(photoId) => _navigationToCarousel(photoId)}
                  />
                </View>

                <Button
                  accessibilityLabel='View all photos'
                  accessible={true}
                  title="VIEW ALL PHOTOS"
                  style={styles.multipleButtons}
                  onPress={() => _navigateToCollage()}
                />

                <Card.Divider style={[globalStyles.divider, styles.multipleButtons]} />
              </View>
            }
            <View>
              <AddPhotoButton
                containerStyle={{ marginBottom: 20 }}
                onPress={() => setAlbumsModalVisible(true)}
              />

              <Button
                accessibilityLabel='View my photos'
                accessible={true}
                title="VIEW MY PHOTOS"
                style={styles.multipleButtons}
                onPress={_navigateToAllMyPhotos} 
              />
            </View>
          </View>
        }
        <PhotosAlbumsAdminModal
          photosModalVisible={photosModalVisible}
          onClosePhotos={() => setPhotosModalVisible(false)}
          onSuccessPhotos={() => {
            setPhotosModalVisible(false);
            refetch();
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
          classId={classId || ''}
        />
      </Card>
    </BaseModule>
  );
}
const styles = StyleSheet.create({
  multipleButtons: {
    marginBottom: 20,
  }
});
