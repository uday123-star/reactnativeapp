import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { Colors } from '../../../styles/colors'
import { MyProfileStackParamList } from '../../../types/types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { globalStyles } from '../../../styles/global-stylesheet'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BirthDateConfidenceLevel, CurrentUser } from '../../../types/interfaces'
import { ComponentState } from '../../../types/enums'

interface Props {
  navigation: NativeStackNavigationProp<MyProfileStackParamList, '_myProfileRoot'>
  currentUser: CurrentUser
}

export const BirthDateSection = ({ navigation, currentUser }: Props) => {
  const { birthDate, birthDateConfidenceLevel } = currentUser;
  const { hasData, isEmpty } = ComponentState;
  const componentState = birthDate ? hasData : isEmpty;
  const { FULL, UPDATING } = BirthDateConfidenceLevel;
  const hasBirthdate = birthDateConfidenceLevel === FULL;

  // useEffect(() => {
  //   DeviceEventEmitter.addListener('event.onHasNewBirthdate', _updateBirthdate);
  //   return () => {
  //     DeviceEventEmitter.removeAllListeners('event.onHasNewBirthdate')
  //   }
  // }, [])

  /**
   * Format the birthdate for the view.
   * @param birthDate in input formatted "1997-01-31" ( from API )
   * @returns string formatted "January 31, 1997"
   */
  const formatBirthDateText = (birthDate: string): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [year, month, day] = birthDate.split('-');
    return `${months[+month - 1]} ${day}, ${year}`
  }

  const _editBirthday = () => {
    navigation.navigate('_editBirthday', {
      birthDate
    });
  }

  if (birthDateConfidenceLevel === UPDATING) {
    return (
      <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 15 }}>
        <Icon.Button name="birthday-cake"
          size={20}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -10, marginRight: 0 }}
        />
        <Placeholder
          Animation={Fade}
        >
          <PlaceholderLine width={30} />
        </Placeholder>
      </View>
    )
  }

  if (componentState === isEmpty) {
    <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 15 }}>
      <Icon.Button name="birthday-cake"
        size={20}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: -10, marginRight: 0 }}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }} onPress={_editBirthday}>Add your Birthdate</Text>
    </View>
  }

  if (componentState === hasData) {
    return (
      <TouchableOpacity
        onPress={_editBirthday}
        style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 15, marginBottom: 10 }}
        accessible={true}
        accessibilityRole='button'
        accessibilityLabel={hasBirthdate ? 'Edit your birthdate' : 'Add your birthdate'}
      >
        <Icon.Button name="birthday-cake"
          size={20}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -10, marginRight: 0 }}
        />
        {
          Boolean(hasBirthdate) && <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text>
              {formatBirthDateText(birthDate)}&nbsp;
            </Text>
            <Icon
              style={{ marginLeft: 5 }}
              name="pencil-square-o"
              color={Colors.darkCyan}
              size={18}
            />
          </View>
        }
        {
          !hasBirthdate && <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }}>Add Birthday</Text>
        }
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 15 }}>
      <Icon.Button name="birthday-cake"
        size={20}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: -10, marginRight: 0 }}
      />
      <Text style={globalStyles.errorText} onPress={_editBirthday}>
        Oops, please try again&nbsp;
      </Text>
    </View>
  )
}
