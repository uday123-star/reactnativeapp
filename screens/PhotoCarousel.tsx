import { useLazyQuery } from '@apollo/client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FetchMyProfileResponse, FETCH_MY_PROFILE } from '../data/queries/my-profile/fetch';
import { GetPhotoResponse, GET_PHOTOS } from '../data/queries/photos/get-featured-photos';
import { GetPhotosAlbumsResponse, GET_PHOTOS_MULTIPURPOSE } from '../data/queries/photos/photos';
import { PhotosCarousel } from '../src/components/carousels/photos';
import { useFocusedStatus } from '../src/hooks';
import { Colors } from '../styles/colors';
import { Photo } from '../types/interfaces';
import { PhotosStackParamList } from '../types/types';

type Props = NativeStackScreenProps<PhotosStackParamList, '_photoCarousel'>

export const PhotoCarouselScreen = ({ route, navigation }: Props): JSX.Element => {
  useFocusedStatus(navigation, route, false);

  const [ firstItem, setFirstItem ] = useState<number>();
  const [ displayPhotos, setDisplayPhotos ] = useState<Photo[]>();
  const { params } = route;
  const {
    type,
    variables,
    index = 0,
    photoId
  } = params;

  const [getPhotosNew, { data: photosNewData }] = useLazyQuery<GetPhotoResponse>(GET_PHOTOS, {
    fetchPolicy: 'cache-only',
    nextFetchPolicy: 'cache-only',
  });
  const [getPhotosMyProfile, { data: photosMyProfileData }] = useLazyQuery<FetchMyProfileResponse>(FETCH_MY_PROFILE, {
    fetchPolicy: 'cache-only',
    nextFetchPolicy: 'cache-only',
  });
  const [getPhotosMulti, { data: photosMultiData }] = useLazyQuery<GetPhotosAlbumsResponse>(GET_PHOTOS_MULTIPURPOSE, {
    fetchPolicy: 'cache-only',
    nextFetchPolicy: 'cache-only',
  });

  useEffect(() => {
    if (type === 'multipurpose') {
      getPhotosMulti({
        variables
      });
    } else if (type === 'new-photos') {
      getPhotosNew({
        variables
      });
    } else {
      getPhotosMyProfile({
        variables
      });
    }
  }, []);

  const resetItems = () => {
    setFirstItem(undefined);
    setDisplayPhotos(undefined);
  }

  useEffect(() => {
    if (photosMultiData) {
      if (firstItem !== undefined) {
        resetItems();
      }
      setDisplayPhotos(photosMultiData.photos.photos);
    }
  }, [ photosMultiData ])

  useEffect(() => {
    if (photosNewData) {
      if (firstItem !== undefined) {
        resetItems();
      }
      setDisplayPhotos(photosNewData.photos.photos);
    }
  }, [ photosNewData ])
  
  useEffect(() => {
    if (photosMyProfileData) {
      if (firstItem !== undefined) {
        resetItems();
      }
      const currentUser = photosMyProfileData.people[0];
      setDisplayPhotos(currentUser.photos);
    }
  }, [ photosMyProfileData ])

  useEffect(() => {
    if (displayPhotos) {
      if (photoId) {
        setFirstItem(displayPhotos.findIndex(photo=> photo.id === photoId))
      } else {
        setFirstItem(index)
      }
    }
  }, [ displayPhotos ]);

  const [ carouselWidth, setCarouselWidth] = useState(0);

  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: 0, backgroundColor: Colors.ligthGray }}
      onLayout={getPhotoCarouselWidth}
      edges={['left', 'right']}
    >
      {
        (carouselWidth !== 0 &&
          displayPhotos &&
        firstItem !== undefined
        ) && <PhotosCarousel
          photos={displayPhotos}
          width={carouselWidth}
          fullScreen={true}
          onPress={(photoId, index, photo) => console.log(photoId,index,photo)}
          firstItem={firstItem}
        />
      }
    </SafeAreaView>
  );
}
