import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { FullProfileScreen, PhotoCarouselScreen, PhotoCollageScreen, PhotosScreen } from '../../../screens'
import { PhotosStackParamList } from '../../../types/types'
import { BackButton } from '../../components/BackButton'
import { MyProfileStack } from './my-profile'

const Photos = createStackNavigator<PhotosStackParamList>()

export const PhotosStack = (): JSX.Element => {
  return (
    <Photos.Navigator initialRouteName='_photos'>
      <Photos.Screen name="_photos"
        component={PhotosScreen}
        options={{
          title: 'Photos'
        }}
      />
      <Photos.Screen name="_photoCollage"
        component={PhotoCollageScreen}
        options={() => ({
          // eslint-disable-next-line react/display-name
          title: 'Photos',
          headerTitleAlign: 'center',
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
        })}
      />
      <Photos.Screen name="_photoCarousel"
        component={PhotoCarouselScreen}
        options={() => ({
          // eslint-disable-next-line react/display-name
          title: 'Photos',
          headerTitleAlign: 'center',
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
        })}
      />
      <Photos.Screen name="_fullProfile"
        component={FullProfileScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Profile',
          headerTitleAlign: 'center'
        })}
      />
      <Photos.Screen name="_myProfile"
        component={MyProfileStack}
        options={{
          headerShown: false
        }}
      />
    </Photos.Navigator>
  )
}
