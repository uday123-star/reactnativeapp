import { ScreenWidth } from '@freakycoder/react-native-helpers'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, LayoutChangeEvent } from 'react-native'
import { Text } from '../../Text'
import { StudentModel } from '../../../../types/interfaces'
import { DividerLine } from '../../DividerLine'
import { PhotosCarousel } from '../photos'
import { useLazyQuery } from '@apollo/client'
import { globalStyles } from '../../../../styles/global-stylesheet'
import { ViewAll } from '../photos/ViewAll'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ClasslistStackParamList } from '../../../../types/types'
import { GetAlbumPhotosArgs, GetPhotosAlbumsResponse, GET_PHOTOS_MULTIPURPOSE, PhotosVisibleState } from '../../../../data/queries/photos/photos'
import { AlbumPrivacyLevels, AlbumType } from '../../../../data/queries/photos/albums'
import { GET_FRIENDSHIP, PeopleResponse } from '../../../../data/queries/people/person-data'
import { useCurrentAffiliation } from '../../../../redux/hooks'
import { StorySection } from './StorySection'
import { IruTags } from '../../iru/iru-tags'
import { BirthDateSection } from './BirthdateSection'
import { TopContent } from './top'

type parentProps = NativeStackScreenProps<ClasslistStackParamList, '_carousel'>
interface ContentProps extends Partial<parentProps> {
  student: StudentModel
  navigateBack?: () => void
  navigateForward?: () => void
  index: number
  length: number
  basicInfoOnly?: boolean
  isSinglePage?: boolean
}

export const Content = (Props: ContentProps): JSX.Element => {
  const { student, navigation, basicInfoOnly = false } = Props;
  const currentAffiliation = useCurrentAffiliation();
  const [albumPrivacyLevels, setAlbumPrivacyLevels] = useState<AlbumPrivacyLevels[]>();

  const [ getFriendship, { data: friendshipData } ] = useLazyQuery<PeopleResponse>(GET_FRIENDSHIP, {
    variables: {
      personId: student.personId,
      schoolId: currentAffiliation.schoolId
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const photosVariables: GetAlbumPhotosArgs = {
    personId: student.personId,
    limit: 20,
    offset: 0,
    filters: {
      albumTypes: [AlbumType.PERSONAL_ALBUM, AlbumType.PROFILE_DEFAULT, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS],
      albumPrivacyLevels: [],
      visibleStates: [PhotosVisibleState.VISIBLE]
    }
  }
  const [getPhotos, { data: photosData, loading: photosLoading }] = useLazyQuery<GetPhotosAlbumsResponse>(GET_PHOTOS_MULTIPURPOSE, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (friendshipData?.people && !photosLoading) {
      const isFriend = friendshipData.people[0].isFriend || false;
      const isCommunityMember = friendshipData.people[0].isCommunityMember || false;
      const albumPrivacyLevels: AlbumPrivacyLevels[] = [AlbumPrivacyLevels.PUBLIC];
      if (isFriend || isCommunityMember) {
        albumPrivacyLevels.push(AlbumPrivacyLevels.COMMUNITY_AND_FRIENDS);
      }
      if (isFriend) {
        albumPrivacyLevels.push(AlbumPrivacyLevels.FRIENDS);
      }
      setAlbumPrivacyLevels(albumPrivacyLevels);
      getPhotos({
        variables: {
          ...photosVariables,
          filters: {
            ...photosVariables.filters,
            albumPrivacyLevels
          }
        },
      });
    }
  }, [friendshipData])

  useEffect(() => {
    if (!basicInfoOnly) {
      getFriendship();
    }
  }, [basicInfoOnly])

  const [ carouselWidth, setCarouselWidth] = useState(0);

  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  const _navigateToCollage = () => {
    navigation?.navigate('_photoCollage', {
      personId: student.personId,
      limit: 100,
      offset: 0,
    });
  }

  const _navigateToCarousel = (photoId: string) => {
    navigation?.navigate('_photoCarousel', {
      photoId,
      type: 'multipurpose',
      variables: {
        ...photosVariables,
        filters: {
          ...photosVariables.filters,
          albumPrivacyLevels
        }
      }
    });
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={{ right: 1 }}
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
      }}
    >

      <TopContent {...Props} />

      {!basicInfoOnly && <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20
        }}
      >
        {(!photosLoading && photosData && (!!photosData.photos?.photos?.length)) && <View onLayout={getPhotoCarouselWidth} style={{ maxWidth: ScreenWidth * 0.85 }}>
          <Text style={[globalStyles.sectionHeaderText, {
            paddingBottom: 10
          }]}
          >Photos</Text>
          <PhotosCarousel
            photos={photosData.photos.photos || []}
            width={carouselWidth}
            staticContent={true}
            rowElements={4}
            callToAction={(index, size, margin) =>
              <ViewAll index={index}
                size={size}
                margin={margin}
                onPress={() => _navigateToCollage()}
              />
            }
            onPress={(photoId) => {
              _navigateToCarousel(photoId)
            }}
            firstItem={0}
          ></PhotosCarousel>
        </View>
        }
        <View
          style={{
            paddingBottom: 20,
          }}
        >
          <DividerLine />
        </View>
        <IruTags
          student={student}
        />
        <View style={{
            marginBottom: 20
          }}
        >
          <StorySection owner={student.personId}>
            <DividerLine />
          </StorySection>

          <BirthDateSection personId={student.personId} hasBirthdateAvailable={student.hasBirthdateAvailable} />
        </View>
      </View>}
    </ScrollView>
  )
}
