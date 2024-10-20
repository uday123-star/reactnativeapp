import * as React from 'react'
import { View, ImageBackground } from 'react-native'
import { Text } from '../src/components/Text'
import { Button } from '../src/components/Button'
import { useAppDispatch } from '../redux/hooks'
import { acceptEULA } from '../redux/slices/core/slice'
import { Colors } from '../styles/colors'
import { globalStyles } from '../styles/global-stylesheet'
import * as WebBrowser from 'expo-web-browser'
import { ScrollView } from 'react-native-gesture-handler'
import { useConfiguration } from '../src/hooks'

export const EndUserLicenseAgreement = () => {
  const dispatch = useAppDispatch()
  const { privacyPolicyUrl, termsOfServiceUrl } = useConfiguration();

  const _acceptEULA = () => {
    dispatch(acceptEULA())
  }

  // opens the forgot page in SFSafariController view
  const _openBrowserAsync = async (url: string) => {
    try {

      // use a linking listener to enable
      // a universal scheme to return to the app
      // see sign in page for an example
      // _addLinkingListener();
      await WebBrowser.openBrowserAsync(
        encodeURI(url)
      );

      // https://github.com/expo/expo/issues/5555
      // if using a linking listener, we need
      // to remove it, to prevent memory leaks
      // and crashes
      // _removeLinkingListener();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={globalStyles.container}
      scrollIndicatorInsets={{ right: 1 }}
    >
      <ImageBackground source={require('../assets/images/APP_BG.jpg')}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <View style={{
            backgroundColor: Colors.whiteRGBA(0.75),
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'column',
            paddingHorizontal: 40
          }}
        >
          <Text style={{
              fontSize: 40,
              fontWeight: '800',
              textAlign: 'center'
            }}
          >
            Welcome to the{'\n'}Classmates<Text style={{ fontSize: 30 }}>™</Text>{'\n'}Mobile App
          </Text>
          <View style={{ paddingVertical: 40 }}>
            <Text style={{
                textAlign: 'center',
                fontSize: 22,
                fontWeight: '400'
              }}
            >
              By using this app, you agree to{'\n'} the
              <Text
                onPress={() => _openBrowserAsync(termsOfServiceUrl)}
                style={[{ fontSize: 22 }, globalStyles.linkColor]}
              > Terms of Service </Text>

              and{'\n'}

              <Text
                style={[{ fontSize: 22 }, globalStyles.linkColor]}
                onPress={() => _openBrowserAsync(privacyPolicyUrl)}
              > Privacy Policy </Text>
            </Text>
          </View>
          <Button
            accessibilityLabel='Accept EULA'
            accessible={true}
            title="AGREE & CONTINUE"
            onPress={_acceptEULA}
            isPartialWidth={true}
          />
        </View>
      </ImageBackground>
    </ScrollView>
  )
}
