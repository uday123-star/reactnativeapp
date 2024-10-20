import React from 'react';
import { KeyboardAvoidingView, Linking, StyleSheet, View, TextInput } from 'react-native';
import { Text } from '../src/components/Text';
import { globalStyles } from '../styles/global-stylesheet';
import { useAppSelector, useSignInForm } from '../redux/hooks';
import { authenticate as auth } from '../redux/slices/current-user/thunks';
import { setAllAffiliations } from '../redux/slices/all-affiliations/slice';
import { selectCurrentAffiliationThunk } from '../redux/slices/current-affiliation/thunks';
import { getDeviceId, isIOS, isIpad } from '../src/helpers/device';
import { setEmail, setPassword } from '../redux/slices/sign-in/slice';
import * as Device from 'expo-device';
import { logEvent } from '../src/helpers/analytics';
import { setUserId } from 'expo-firebase-analytics';
import * as WebBrowser from 'expo-web-browser';
import { refetchAllAffiliationThunk } from '../redux/slices/my-profile/thunks';
import { useAppThunkDispatch } from '../redux/store';
import { setIsSignedIn } from '../redux/slices/current-user/slice';
import { DdRum, DdSdkReactNative, ErrorSource, RumActionType } from '@datadog/mobile-react-native';
import { dataDogStartAction } from '../src/helpers/datadog';
import { useConfiguration } from '../src/hooks';
import { SignInWrapper } from '../src/components/SignInWrapper';
import { Button } from '../src/components/Button';
import { FontAwesome } from '@expo/vector-icons';

interface EmitterSubscription {
  remove(): void
}

export const SignInScreen = (): JSX.Element => {
  const dispatch = useAppThunkDispatch();
  const userAgent = useAppSelector(state => state.core.userAgent);
  const { refreshTokenExpired, isLoading } = useAppSelector(state => state.currentUser);
  const { email, password, visitorId, hasError } = useSignInForm();
  const { mobilePasswordResetUrl } = useConfiguration();
  let subscription: EmitterSubscription;

  const _handleRedirect = () => {
    if (isIOS()) {
      WebBrowser.dismissBrowser();
    } else {
      _removeLinkingListener();
    }
  };

  const _addLinkingListener = () => {
    subscription = Linking.addEventListener('url', _handleRedirect);
  };

  const _removeLinkingListener = () => {
    subscription.remove();
  };

  // opens the forgot page in SFSafariController view
  const _openBrowserAsync = async () => {
    try {
      _addLinkingListener();
      await WebBrowser.openBrowserAsync(
        // the web url we want to open
        mobilePasswordResetUrl
      );

      // https://github.com/expo/expo/issues/5555
      if (isIOS()) {
        _removeLinkingListener();
      }

      // enable for debugging, what url is
      // the SFSafariController trying to open
      // console.log('the state : ', result);
    } catch (error: any) {
      DdRum.addError(
        error?.message || 'Error opening SFSafariController',
        ErrorSource.SOURCE,
        error?.stack || 'SignInScreen.tsx',
        {
          error,
          mobilePasswordResetUrl
        },
        Date.now()
      )
    }
  };

  async function _authenticate() {
    try {
      dataDogStartAction(RumActionType.TAP, 'SignIn Button', {}, Date.now());

      const variables = { email, password, userAgent, visitorId, deviceId: await getDeviceId() };
      // First we asynchronously call the login endpoint
      const { login } = await dispatch(auth(variables)).unwrap();

      setUserId(login.me.id);

      logEvent('login',{
        user: login.me.id,
        osName: Device.osName
      })

      // Datadog RUM
      DdSdkReactNative.setUser({
        id: `${login.me.id}`,
        name: `${login.me.firstName} ${login.me.lastName}`,
        membership: `${login.me.membershipState}`
      })

      const affiliationsResponse = await dispatch(refetchAllAffiliationThunk()).unwrap();
      // Then we synchrounously set all affiliations, from the response
      dispatch(setAllAffiliations(affiliationsResponse?.affiliations || []));

      // Then we synchrounously grab the primary affiliation...
      // and set it as the default current affilaition.
      dispatch(selectCurrentAffiliationThunk({ usePrimary: true }));
      dispatch(setIsSignedIn());
    } catch (error: any) {
      DdRum.addError(
        error?.message || 'Error authenticating',
        ErrorSource.SOURCE,
        error?.stack || 'SignInScreen.tsx',
        {
          error,
          email,
          password: '********',
          userAgent,
          visitorId
        },
        Date.now()
      )
    }
  }

  if (isLoading) {
    return (
      <SignInWrapper>
        <Text style={styles.loadingText}>Loading...</Text>
      </SignInWrapper>
    )
  }

  return (
    <SignInWrapper>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardSafeZone}>
        <View style={[globalStyles.veiledSection, styles.loginSection, { flexDirection: 'column', justifyContent: 'space-around' }]}>
          <View>
            <Text style={globalStyles.headerText}>
              Login
            </Text>
          </View>

          <View style={{ marginHorizontal: 5 }}>
            <View>
              <Text style={[globalStyles.inputLabelText, styles.inputLabel ]}>Email</Text>
            </View>
            <View style={[styles.inputContainer, { marginBottom: 20 }]}>
              <View style={styles.loginInput}>
                <FontAwesome name='envelope'
                  size={20}
                />
                <TextInput
                  accessibilityLabel='Email address'
                  accessible={true}
                  accessibilityRole='text'
                  placeholder='email address'
                  value={email}
                  keyboardType='email-address'
                  style={styles.input}
                  onChangeText={(value) => dispatch(setEmail(value))}
                  autoComplete='email'
                />
              </View>
            </View>
            <View>
              <Text style={[globalStyles.inputLabelText, styles.inputLabel]}>Password</Text>
            </View>
            <View style={[styles.inputContainer, { marginBottom: 10 }]}>
              <View style={styles.loginInput}>
                <FontAwesome name='lock'
                  size={24}
                  style={styles.lockIcon}
                />
                <TextInput
                  accessibilityLabel='Password'
                  accessible={true}
                  accessibilityRole='text'
                  placeholder='password'
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={(value) => dispatch(setPassword(value))}
                  autoComplete='password'
                />
                <Text style={[globalStyles.linkColor, styles.forgotText, { right: isIpad() ? 15 : 5 }]}
                  onPress={_openBrowserAsync}
                  accessibilityLabel="forgot password?"
                  accessibilityRole="link"
                >
                  Forgot?
                </Text>
              </View>
            </View>
          </View>
          {Boolean(hasError) && (
            <View
              accessibilityLabel='Error message: Oops, invalid username or password.'
              accessible={true}
              accessibilityRole='text'
            >
              <Text
                style={globalStyles.errorText}
              >
                Oops, invalid username or password.
              </Text>
            </View>
          )}
          {Boolean(refreshTokenExpired) && (
            <View
              accessibilityLabel='Error message: Your session has expired, please login again.'
              accessible={true}
              accessibilityRole='text'
            >
              <Text
                style={globalStyles.errorText}
              >
                Your session has expired, please login again.
              </Text>
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            <Button
              accessibilityLabel='Login'
              accessible={true}
              title="LOGIN"
              onPress={_authenticate}
              isPartialWidth={true}
            />
          </View>
        </View>
        {/* <View style={{ backgroundColor: Colors.ligthGray, borderRadius: 40, display: 'flex', alignItems: 'center', marginHorizontal: 20 }}>
              <Text style={{
                display: 'flex',
                color: 'black',
                padding: 10,
                fontWeight: 'bold',
                fontSize: 16 }}
              >
                Members Only. Sign up at classmates.com
              </Text>
            </View> */}
      </KeyboardAvoidingView>
    </SignInWrapper>
  )
}

const styles = StyleSheet.create({
  keyboardSafeZone: {
    flex: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    margin: 50,
    marginTop: 80,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  loginSection: {
    paddingVertical: 20,
    margin: 10,
    marginBottom: 15,
    display: 'flex',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 10,
    borderRadius: 50,
  },
  loginInput: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    height: 40,
    flexGrow: 1,
    paddingHorizontal: 10,
    fontSize: 16
  },
  inputLabel: {
    fontWeight: 'bold',
  },
  lockIcon: {
    flexShrink: 1,
    marginLeft: 2,
  },
  signUpSection: {
    alignSelf: 'center',
    height: 40,
    width: '65%',
  },
  signUpText: {
    color: 'black',
    alignSelf: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    flexShrink: 1,
  }
});
