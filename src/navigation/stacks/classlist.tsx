import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react'
import { View } from 'react-native';
import { ClasslistScreen, FullProfileScreen, PhotoCarouselScreen, PhotoCollageScreen, ProfileCarouselScreen } from '../../../screens';
import { ClasslistStackParamList } from '../../../types/types';
import { BackButton } from '../../components/BackButton';
import { MyProfileStack } from './my-profile';

const Classlist = createStackNavigator<ClasslistStackParamList>()

export const ClassListStack = (): JSX.Element => {

  return (
    <Classlist.Navigator initialRouteName="_classlist">
      <Classlist.Screen name="_classlist"
        component={ClasslistScreen}
        options={{
          headerShown: true,
          title: 'Classlist',
          headerTitleAlign: 'center',
          headerLeft: () => {
            return (<View />);
          }
        }}
      />
      <Classlist.Screen name="_carousel"
        component={ProfileCarouselScreen}
        options={() => ({
          // eslint-disable-next-line react/display-name
          title: 'Profile',
          headerTitleAlign: 'center',
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
        })}
      />
      <Classlist.Screen name="_fullProfile"
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
      <Classlist.Screen name="_photoCollage"
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
      <Classlist.Screen name="_photoCarousel"
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
      <Classlist.Screen name="_myProfile"
        component={MyProfileStack}
        options={{
          headerShown: false
        }}
      />
    </Classlist.Navigator>
  )
}
