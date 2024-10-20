import React from 'react'
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer'
import { Tabs } from './bottom-tab'
import { ConversationsStack, MyProfileStack } from './stacks/index'
import { Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useAppDispatch, useCurrentUser, useHasSeenConversationsWelcomeScreen, useIsGoldMember } from '../../redux/hooks'
import { signOut } from '../../redux/slices/current-user/slice'
import { Colors } from '../../styles/colors'
import { logEvent } from '../helpers/analytics'
import { FAQScreen, PrivacyPolicyScreen, TermsOfServiceScreen, UpgradeScreen } from '../../screens'
import { BackButton } from '../components/BackButton'
import { dataDogStartAction } from '../helpers/datadog'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { useApolloClient } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../types/types'
import { useConfiguration } from '../hooks'

const BaseDrawer = createDrawerNavigator()
const { darkCyan } = Colors

const logout = () => {
  const currentUser = useCurrentUser();
  const dispatch = useAppDispatch();
  const apolloClient = useApolloClient();
  return async () => {
    const { TAP } = RumActionType;
    dataDogStartAction(TAP, 'Logout Button', {}, Date.now());
    logEvent('logout', {});
    try {
      apolloClient.stop();
      await apolloClient.cache.reset();
      await apolloClient.clearStore();
      dispatch(signOut({}));
    } catch (error) {
      DdRum.addError('Logout error', ErrorSource.SOURCE, JSON.stringify(error), {
        error,
        currentUser
      }, Date.now());
    }
  }
};

const CustomDrawerContent = (props: DrawerContentComponentProps): JSX.Element => {
  return (
    <DrawerContentScrollView style={{ flex: 1, width: '100%', flexDirection: 'row', paddingBottom: 20 }} {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label={() => <Text
        style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
        accessible={true}
        accessibilityLabel='Logout'
        accessibilityRole='button'
      >Logout</Text>}
        style={{ backgroundColor: darkCyan, position: 'absolute', bottom: 10, width: '100%' }}
        onPress={logout()}
      />
    </DrawerContentScrollView>
  );
}

export const Drawer = (): JSX.Element => {
  const isGold = useIsGoldMember()
  const { features: { isConversationsEnabled }} = useConfiguration();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const shouldSeeWelcomeScreen = !useHasSeenConversationsWelcomeScreen()
  return (
    <BaseDrawer.Navigator
      screenOptions={{ drawerPosition: 'right', headerShown: false, drawerActiveBackgroundColor: 'transparent', swipeEnabled: false }}
      drawerContent={props => <CustomDrawerContent {...props} />}
      useLegacyImplementation={false}
    >
      <BaseDrawer.Screen name="_back"
        component={Tabs}
        options={{ title: '', drawerItemStyle: {
          backgroundColor: 'transparent',
          position: 'relative'
        }, drawerLabelStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          width: '300%',
          height: '300%',
          left: '-150%',
          top: '-150%',
        }, drawerIcon: () =>
          <Icon.Button name="angle-left"
            size={30}
            color={'black'}
            backgroundColor={'transparent'}
            style={{ padding: 0, margin: 0 }}
          />
        }}
      />
      <BaseDrawer.Screen name="MyProfile"
        component={MyProfileStack}
        options={{
          drawerLabel: () => {
            return (<Text
              accessible={true}
              accessibilityLabel='My Profile'
              accessibilityRole='button'
              style={{ color: Colors.darkCyan, fontWeight: 'bold', fontSize: 16 }}
            >My Profile</Text>)
          }
        }}
      />
      {
        Boolean(isConversationsEnabled) && (
          <BaseDrawer.Screen name="Conversations"
            component={ConversationsStack}
            listeners={{
              drawerItemPress: (e) => {
                e.preventDefault();
                if (shouldSeeWelcomeScreen) {
                  return navigation.navigate('Conversations', {
                    screen: '_welcome'
                  });
                }
                return navigation.navigate('Conversations', {
                  screen: '_feed'
                });
              }
            }}
            options={() => ({
              headerLeft: (props) => (
                <BackButton
                  {...props}
                />
              ),
              headerShown: false,
              unmountOnBlur: true,
              drawerLabel: ({ color }) => {
                return (<Text
                  accessible={true}
                  accessibilityLabel='Classmates© Conversations'
                  accessibilityRole='button'
                  style={{ color }}
                >Classmates© Conversations</Text>)
              },
              headerTitleAlign: 'center',
            })}
          />
        )
      }
      <BaseDrawer.Screen name="_pp"
        component={PrivacyPolicyScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          headerShown: true,
          title: 'Privacy Policy',
          drawerLabel: ({ color }) => {
            return (<Text
              accessible={true}
              accessibilityLabel='Privacy Policy'
              accessibilityRole='button'
              style={{ color }}
            >Privacy Policy</Text>)
          },
          headerTitleAlign: 'center',
        })}
      />
      <BaseDrawer.Screen name="_tos"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={TermsOfServiceScreen as any}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          headerShown: true,
          unmountOnBlur: true,
          title: 'Terms of Service',
          drawerLabel: ({ color }) => {
            return (<Text
              accessible={true}
              accessibilityLabel='Terms of Service'
              accessibilityRole='button'
              style={{ color }}
            >Terms of Service</Text>)
          },
          headerTitleAlign: 'center',
        })}
      />
      <BaseDrawer.Screen name="_faq"
        component={FAQScreen}
        options={() => ({
          headerLeft: (props) => (
            <BackButton
              {...props}
            />
          ),
          headerShown: true,
          unmountOnBlur: true,
          title: 'FAQ',
          drawerLabel: ({ color }) => {
            return (<Text
              accessible={true}
              accessibilityLabel='FAQ'
              accessibilityRole='button'
              style={{ color }}
            >FAQ</Text>)
          },
          headerTitleAlign: 'center',
        })}
      />
      {
        !isGold && (
          <BaseDrawer.Screen name="_upgrade"
            component={UpgradeScreen}
            options={() => ({
              headerLeft: (props) => (
                <BackButton
                  {...props}
                />
              ),
              headerShown: true,
              unmountOnBlur: true,
              headerStyle: { backgroundColor: Colors.darkCyan, shadowColor: 'transparent' },
              title: '',
              headerTitleAlign: 'center',
            })}
          />
        )
      }
    </BaseDrawer.Navigator>
  )
}
