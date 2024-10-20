import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useHasSeenConversationsWelcomeScreen } from '../../../redux/hooks'
import { ConversationsWelcomeScreen } from '../../../screens/ConversationsWelcome'
import { ConversationsStackParamList } from '../../../types/types'
import { BackButton, IconFamily } from '../../components/BackButton'
import { Colors } from '../../../styles/colors'
import { ConversationsFeedPage } from '../../../screens/ConversationsFeed'
import { ConversationsInfoScreen } from '../../../screens/ConversationsInfo'
import { ConversationScreen } from '../../../screens/Conversation'
import { NewConversation } from '../../../screens/NewConversation'
import { NewComment } from '../../../screens/NewComment'
import { NewReply } from '../../../screens/NewReply'
import { FullProfileScreen, PhotoCarouselScreen, PhotoCollageScreen, TermsOfServiceScreen } from '../../../screens'
import { HelpScreen } from '../../../screens/HelpScreen'
import { MyProfileStack } from './my-profile'

const Conversations = createStackNavigator<ConversationsStackParamList>()

export const ConversationsStack = (): JSX.Element => {
  const shouldSeeWelcomeScreen = !useHasSeenConversationsWelcomeScreen()

  return (
    <Conversations.Navigator>
      {Boolean(shouldSeeWelcomeScreen) &&
        <Conversations.Screen name="_welcome"
          component={ConversationsWelcomeScreen}
          options={() => ({
            headerLeft: (props) => (
              <BackButton
                {...props}
                color={Colors.whiteRGBA(0.5)}
              />
            ),
            title: '',
            headerStyle: {
              backgroundColor: Colors.purple,

              // https://stackoverflow.com/questions/42709730/how-do-i-hide-the-shadow-under-react-navigation-headers
              elevation: 0, // hides for android
              shadowOpacity: 0  // hides for IOS
            },
            headerTitleAlign: 'center'
          })}
        />
      }
      <Conversations.Screen name="_feed"
        component={ConversationsFeedPage}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Conversations',
          headerTitleAlign: 'center'
        })}
      />
      <Conversations.Screen name="_info"
        component={ConversationsInfoScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
              color={Colors.whiteRGBA()}
            />
          ),
          title: 'Conversations',
          headerTitleAlign: 'center',
          headerTintColor: Colors.whiteRGBA(),
          headerStyle: {
            backgroundColor: Colors.darkCyan,

            // https://stackoverflow.com/questions/42709730/how-do-i-hide-the-shadow-under-react-navigation-headers
            elevation: 0, // hides for android
            shadowOpacity: 0  // hides for IOS
          }
        })}
      />
      <Conversations.Screen name="_conversation"
        component={ConversationScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Conversations',
          headerTitleAlign: 'center',
        })}
      />
      <Conversations.Screen name="_createConversation"
        component={NewConversation}
        options={() => {
          return {
            headerLeft: (props) => (
              <BackButton
                {...props}
                iconName='close'
                iconFamily={IconFamily.AntDesign}
                iconStyle={{ paddingHorizontal: 10 }}
              />
            ),
            title: 'Conversations',
            headerStyle: {
              backgroundColor: Colors.textInputGray
            },
            headerTitleAlign: 'center',
            presentation: 'modal'
          }
        }}
      />
      <Conversations.Screen name="_createComment"
        component={NewComment}
        options={() => {
          return {
            headerLeft: (props) => (
              <BackButton
                {...props}
                iconName='close'
                iconFamily={IconFamily.AntDesign}
                iconStyle={{ paddingHorizontal: 10 }}
              />
            ),
            title: 'Conversations',
            headerStyle: {
              backgroundColor: Colors.textInputGray
            },
            headerTitleAlign: 'center',
            presentation: 'modal'
          }
        }}
      />
      <Conversations.Screen name='_createReply'
        component={NewReply}
        options={() => {
          return {
            headerLeft: (props) => (
              <BackButton
                {...props}
                iconName='close'
                iconFamily={IconFamily.AntDesign}
                iconStyle={{ paddingHorizontal: 10 }}
              />
            ),
            title: 'Conversations',
            headerStyle: {
              backgroundColor: Colors.textInputGray
            },
            headerTitleAlign: 'center',
            presentation: 'modal'
          }
        }}
      />
      <Conversations.Screen name="_fullProfile"
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
      <Conversations.Screen name="_myProfile"
        component={MyProfileStack}
        options={{
          headerShown: false
        }}
      />
      <Conversations.Screen name="_tos"
        component={TermsOfServiceScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Terms of Service',
          headerTitleAlign: 'center'
        })}
      />
      <Conversations.Screen name="_help"
        component={HelpScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          title: 'Help',
          headerTitleAlign: 'center'
        })}
      />
      <Conversations.Screen name="_photoCarousel"
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
      <Conversations.Screen name="_photoCollage"
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
    </Conversations.Navigator>
  )
}
