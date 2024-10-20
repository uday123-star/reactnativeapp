import { useQuery } from '@apollo/client';
import React from 'react';
import { View, ImageBackground, Text } from 'react-native';
import { FetchUserResponse, USER_BASIC_DATA } from '../../../../data/queries/user-data/fetch';
import { AffiliationModel, Photo } from '../../../../types/interfaces';
import { BackButton } from '../../BackButton';
import { ForwardButton } from '../../ForwardButton';
import UserListItem from '../../UserListItem';
import { Colors } from '../../../../styles/colors';
import GuestbookVisitBar from '../../guestbook/carousel-visit-bar';
import { useCurrentUserId, useIsSignedIn } from '../../../../redux/hooks';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/core';
import { useNavigationState } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types/types';

export interface CallToAction {
  id: string
  callToAction: (index: number, size: number, margin: number) => JSX.Element
}

interface ContentProps {
  photo: Photo | CallToAction
  size: number
  index: number
  length: number
  margin?: number
  onPress?: (photoId:string, index: number, photo: Photo) => void
  navigateBack?: () => void
  navigateForward?: () => void
  onReport?: (photo: Photo) => void
}

export const ContentFullScreen = ({ photo, size, index, length, margin, onPress, navigateBack, navigateForward, onReport }: ContentProps): JSX.Element => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const routes = useNavigationState(state => state.routes);

  const _navigateToProfile = (targetId: string) => {
    if (targetId === currentUserId) {
      try {
        const myProfileIndex = routes.findIndex(route => route.name === '_myProfileRoot');
        if (myProfileIndex !== -1) {
          let prevPos = (routes.length - myProfileIndex) - 1;
          while (prevPos) {
            navigation.goBack();
            prevPos--;
          }
          return;
        }
      } catch (error) {
        console.log(error);
      }
      navigation.navigate('Photos', {
        screen: '_myProfile'
      });
      return;
    }
    navigation.navigate('Photos',{
      screen: '_fullProfile',
      params: {
        targetId: targetId
      }
    });
  }

  if (('callToAction' in photo)) {
    return photo.callToAction(index, size, margin || 0)
  }
  const { data: authorData, loading: loadingAuthorData } = useQuery<FetchUserResponse>(USER_BASIC_DATA, {
    variables: {
      id: photo.createdBy
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const currentUserId = useCurrentUserId();
  const isCurrentUserPhoto = useIsSignedIn(photo.createdBy);

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Carousel Navigation */}
      <View
        style={{
          paddingHorizontal: 20,
          flexBasis: 60,
          paddingTop: 10
        }}
      >
        <View style={{ width: '100%', position: 'relative' }}>
          <View style={{ position: 'absolute', left: 0, top: 0 }}>
            {index > 0 &&
              <BackButton
                onPress={navigateBack}
                shouldUseCustomOnPress={true}
                iconStyle={{
                  paddingHorizontal: 0,
                }}
              />
            }
          </View>
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            {index < (length - 1) &&
              <ForwardButton
                onPress={navigateForward}
                iconStyle={{
                  paddingHorizontal: 0,
                }}
              />
            }
          </View>
        </View>
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#000'
          }}
        >
          <ImageBackground
            source={{
              uri: photo.display?.url
            }}
            resizeMode='contain'
            style={{
              flex: 1
            }}
            accessibilityLabel='Image'
            accessibilityRole='image'
          >
            <TouchableOpacity
              style={{
                width: '100%',
                height: '100%'
              }}
              onPress={() => onPress ? onPress(photo.id, index, photo) : null}
            />
          </ImageBackground>
        </View>
      </View>
      {
        !isCurrentUserPhoto && <View
          style={{
            flexBasis: 26,
            alignContent: 'center',
            alignItems: 'flex-end',
            backgroundColor: Colors.whiteLevel(3),
            paddingRight: 10
          }}
        >
          <TouchableHighlight
            onPress={() => onReport ? onReport(photo) : null}
            underlayColor='transparent'
            accessible={true}
            accessibilityLabel='Report Photo'
            accessibilityRole='link'
          >
            <Text style={{
                fontSize: 14,
                textAlign: 'right',
                width: 'auto',
                lineHeight: 26,
                height: 26,
                color: Colors.darkCyan,
                fontWeight: '700'
              }}
            >REPORT PHOTO</Text>
          </TouchableHighlight>
        </View>
      }
      <View
        style={{
          flexBasis: 110,
          flexDirection: 'column',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <UserListItem
              student={authorData?.people[0]}
              affiliation={authorData?.people[0].primaryAffiliation as AffiliationModel}
              isLoading={loadingAuthorData}
              isInFlashList={false}
              avatarSize={50}
              onPress={() => _navigateToProfile(authorData?.people[0].personId || '')}
            />
          </View>
        </View>
        <View
          style={{
            flexBasis: 50,
            flexDirection: 'row',
            paddingHorizontal: 10,
            alignItems: 'center',
          }}
        >
          {
            authorData && <View style={{ flexDirection: 'row', height: 'auto' }}>
              <GuestbookVisitBar
                student={authorData.people[0]}
                visitOrigin='photo_carousel:photos'
                autoHeight={true}
              />
            </View>
          }
        </View>
      </View>
    </View>
  )
}
