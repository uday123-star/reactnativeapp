import React from 'react'
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { HomeScreen, MenuScreen, ProfileVisitsScreen } from '../../screens'
import { ClassListStack, PhotosStack } from './stacks/index'
import { Screens } from '../helpers/screens'
import { isIOS, isIpad } from '../helpers/device'
import { useConfiguration } from '../hooks'

export const BottomTab = createBottomTabNavigator()

export type BottomTabParamsList = {
  'Home': undefined
  'Classlist': { screen?: string; params?: { studentId: string; schoolId: string } }
  'Photos': { screen?: string; params?: { targetId: string }}
  'ProfileVisits': undefined
  'Menu': undefined
}

export type HomeTabProps = BottomTabNavigationProp<BottomTabParamsList, 'Home'>

export const Tabs = (): JSX.Element => {
  const screens = new Screens();
  const { features: { isProfileVisitsEnabled }} = useConfiguration();
  let iconSize = isIOS() ? screens.hunit * 3 : screens.hunit * 4;

  if (isIpad()) {
    iconSize = 40
  }

  const tabBarIconStyle = isIpad()
    ? { height: 50, width: 50 }
    : null

  const TabIcon = ({ color, size, name }: { size: number; color: string; name: string }) => {
    return (<View>
      <Icon name={name}
        size={size}
        color={color}
      />
    </View>)
  }

  return (
    <BottomTab.Navigator screenOptions={{
      tabBarInactiveTintColor: '#000',
      tabBarActiveTintColor: '#009C9A',
      tabBarStyle: {
        paddingTop: screens.hunit * 2,
        paddingBottom: isIOS() ? screens.hunit * 3 : screens.hunit * 2,
        height: screens.getFooterHeight(),
      },
      tabBarIconStyle
    }}
    >
      <BottomTab.Screen name="Home"
        component={HomeScreen}
        options={{
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home"
              color={color}
              size={isIpad() ? 40 : iconSize}
            />
          ),
          headerTitleAlign: 'center',
        }}
      />
      <BottomTab.Screen
        name="Classlist"
        component={ClassListStack}

        // fix to prevent case where screen params do not get reset
        // https://cmates.atlassian.net/browse/MAT-203
        // https://www.reactnativeschool.com/reset-stack-inside-tab-after-leaving-tab
        // https://github.com/react-navigation/react-navigation/issues/8583
        listeners={({ navigation }) => ({
          tabPress(event) {
            event?.preventDefault()
            navigation.navigate('Classlist')
          }
        })}
        options={{
          title: 'Class List',
          unmountOnBlur: true,
          headerShown: false,
          tabBarAccessibilityLabel: 'Classlist',
          tabBarIcon: ({ color }) => (
            <TabIcon name="graduation-cap"
              color={color}
              size={isIpad() ? 40 : iconSize}
            />
          ),
          headerTitleAlign: 'center',
      }}
      />
      <BottomTab.Screen name="Photos"
        component={PhotosStack}
        // fix to prevent case where screen params do not get reset
        // https://cmates.atlassian.net/browse/MAT-203
        // https://www.reactnativeschool.com/reset-stack-inside-tab-after-leaving-tab
        // https://github.com/react-navigation/react-navigation/issues/8583
        listeners={({ navigation }) => ({
          tabPress(event) {
            event?.preventDefault()
            navigation.navigate('Photos', { screen: '_photos' })
          }
        })}
        options={{
          unmountOnBlur: true,
          headerShown: false,
          tabBarAccessibilityLabel: 'Photos',
          tabBarIcon: ({ color }) => (
            <TabIcon name="photo"
              color={color}
              size={isIpad() ? 40 : iconSize}
            />
          ),
          headerTitleAlign: 'center',
      }}
      />
      {Boolean(isProfileVisitsEnabled) &&
        <BottomTab.Screen name="ProfileVisits"
          component={ProfileVisitsScreen}
          options={{
            title: 'Profile Visits',
            tabBarAccessibilityLabel: 'Profile Visits',
            tabBarIcon: ({ color }) => (
              <TabIcon name="group"
                color={color}
                size={isIpad() ? 40 : iconSize}
              />
            ),
            headerTitleAlign: 'center',
        }}
        />
      }
      <BottomTab.Screen name="Menu"
        component={MenuScreen}
        options={({ navigation }) => ({
          // eslint-disable-next-line react/display-name
          tabBarAccessibilityLabel: 'Menu',
          tabBarButton: (props) => (
            <TouchableOpacity {...props}
              onPress={() => {
              navigation.toggleDrawer();
            }}
            />
          ),
          tabBarIcon: ({ color }) => (
            <TabIcon name="reorder"
              color={color}
              size={isIpad() ? 40 : iconSize}
            />
          ),
      })}
      />
    </BottomTab.Navigator>
  )
}
