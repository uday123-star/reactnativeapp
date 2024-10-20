import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { Colors } from '../../../styles/colors'
import { ComponentState } from '../../../types/enums'
import { CurrentUser } from '../../../types/interfaces'
import { MyProfileStackParamList } from '../../../types/types'

interface Props {
  navigation: NativeStackNavigationProp<MyProfileStackParamList, '_myProfileRoot'>
  route: RouteProp<MyProfileStackParamList, '_myProfileRoot'>
  currentUser: CurrentUser
}

export const MyLocationSection = ({ navigation, currentUser }: Props): JSX.Element => {
  const { currentCity, currentState } = currentUser;
  const { isEmpty, hasLoaded } = ComponentState;
  const componentState = (!currentCity || !currentState) ? isEmpty : hasLoaded;

  const _editLocation = () => {
    navigation.navigate('_stateSelection', {
      currentState,
      currentCity
    });
  }

  const loading = (
    currentCity === 'UPDATING' ||
    currentState === 'UPDATING'
  );

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row' }}>
        <Icon.Button name="map-marker"
          size={20}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -10, marginRight: 0 }}
        />
        {Boolean(loading) &&
          <Placeholder Animation={Fade}>
            <PlaceholderLine width={60} />
          </Placeholder>
        }

        {Boolean(!loading && (componentState === isEmpty)) &&
          <Text
            style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }}
            onPress={_editLocation}
            accessible={true}
            accessibilityLabel='Add your current location'
            accessibilityRole='button'
          >Add/Edit your City, State</Text>
        }
        {Boolean(!loading && (componentState === hasLoaded)) && (
          <TouchableOpacity
            onPress={_editLocation}
            style={{ flexDirection: 'row', alignItems: 'baseline' }}
            accessible={false}
          >
            <Text>
              {`${currentCity}, ${currentState}`}&nbsp;
            </Text>
            <Icon
              style={{ marginLeft: 5 }}
              name="pencil-square-o"
              color={Colors.darkCyan}
              size={18}
              accessible={true}
              accessibilityLabel='Edit your current location'
              accessibilityRole='button'
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
