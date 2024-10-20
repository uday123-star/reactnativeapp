import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { Colors } from '../styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { Button } from '../src/components/Button';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useAppDispatch } from '../redux/hooks';
import { hasSeenTrackingScreen } from '../redux/slices/core/slice';

export const TrackingScreen = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const _requestPermission = async () => {
    const { granted } = await requestTrackingPermissionsAsync();

    if (granted) {
      console.log('Tracking permission granted');
    }

    dispatch(hasSeenTrackingScreen())
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.cyan }}
      contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
      scrollIndicatorInsets={{ right: 1 }}
    >
      <ImageBackground source={require('../assets/images/background_pattern.png')}
        style={styles.background}
        resizeMode='repeat'
      >
        <View style={styles.main}>
          <Text style={styles.title}>Allow tracking on the next screen for:</Text>
          <View style={styles.descriptionContainer}>
            <View style={styles.iconContainer}>
              <Icon
                name='heart'
                style={styles.descriptionIcon}
              />
            </View>
            <View style={styles.descriptionTextContainer}>
              <Text style={styles.description}>Special offers and promotions just for you</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <View style={styles.iconContainer}>
              <IconFA
                name='hand-sparkles'
                style={styles.descriptionIcon}
              />
            </View>
            <View style={styles.descriptionTextContainer}>
              <Text style={styles.description}>Member activity for notification purposes</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <View style={styles.iconContainer}>
              <IconEntypo
                name='bar-graph'
                style={styles.descriptionIcon}
              />
            </View>
            <View style={styles.descriptionTextContainer}>
              <Text style={styles.description}>An improved personalized experience over time</Text>
            </View>
          </View>
          <View style={[styles.descriptionContainer,{
              flex: 1,
              justifyContent: 'center',
              marginVertical: 10,
            }]}
          >
            <Text style={styles.description}>You can change this option later in the Settings app.</Text>
          </View>
          <View style={[styles.descriptionContainer,{
              flex: 1,
              justifyContent: 'center'
            }]}
          >
            <Button
              title='CONTINUE'
              style={{ paddingVertical: 12 }}
              onPress={() => _requestPermission()}
              textColor={Colors.cyan}
              backgroundColor={Colors.whiteRGBA()} 
              accessibilityLabel='continue' 
              accessible={true}
            />
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    zIndex: -1
  },
  main: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    color: Colors.whiteRGBA(),
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'left',
    width: '100%',
    marginBottom: 20
  },
  descriptionContainer: {
    flex: 1,
    flexDirection: 'row',
    flexBasis: 70,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    maxHeight: 70
  },
  descriptionTextContainer: {
    flex: 1,
    paddingStart: 10
  },
  description: {
    fontWeight: '500',
    color: Colors.whiteRGBA(),
    fontSize: 22,
    lineHeight: 22
  },
  iconContainer: {
    padding: 10,
  },
  descriptionIcon: {
    color: Colors.cyan,
    fontSize: 30,
    backgroundColor: Colors.whiteRGBA(),
    width: 50,
    height: 50,
    borderRadius: 25,
    flex: 1,
    flexShrink: 1,
    flexBasis: 50,
    overflow: 'hidden',
    textAlign: 'center',
    paddingTop: 10
  }
});
