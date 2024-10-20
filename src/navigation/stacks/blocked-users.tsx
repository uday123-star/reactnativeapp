import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react'
import { BlockedUsersScreen } from '../../../screens';
import { BlockedUsersStackParamList } from '../../../types/types';
import { BackButton, IconFamily } from '../../components/BackButton';

const BlockedUsers = createStackNavigator<BlockedUsersStackParamList>();

export const BlockedUserStack = (): JSX.Element => {
  return (
    <BlockedUsers.Navigator>
      <BlockedUsers.Screen
        name="_blockedUsersPage"
        component={BlockedUsersScreen}
        options={() => ({
          title: 'Blocked Users',
          headerTitleAlign: 'center',
          headerLeft: (props) => (
            <BackButton
              {...props}
              iconName='close'
              iconFamily={IconFamily.AntDesign}
            />
          )
        })}
      />
    </BlockedUsers.Navigator>
  )
}
