import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { BirthdateEditScreen, CitySelectionScreen, MyProfileScreen, PhotoCarouselScreen, PhotoCollageScreen, StateSelectionScreen } from '../../../screens'
import { MyProfileStackParamList } from '../../../types/types'
import { BackButton } from '../../components/BackButton'

const MyProfile = createStackNavigator<MyProfileStackParamList>()

export const MyProfileStack = (): JSX.Element => {
  return (
    <MyProfile.Navigator>
      <MyProfile.Screen name="_myProfileRoot"
        component={MyProfileScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'My Profile',
          headerTitleAlign: 'center'
        })}
      />
      <MyProfile.Screen name="_stateSelection"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={StateSelectionScreen as any}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Update your location',
          headerTitleAlign: 'center'
        })}
      />
      <MyProfile.Screen name='_citySelection'
        component={CitySelectionScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Update your location',
          headerTitleAlign: 'center'
        })}
      />
      <MyProfile.Screen name='_editBirthday'
        component={BirthdateEditScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Update Your Birthday',
          headerTitleAlign: 'center'
        })}
      />
      <MyProfile.Screen name="_photoCollage"
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
      <MyProfile.Screen name="_photoCarousel"
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
    </MyProfile.Navigator>
  )
}
