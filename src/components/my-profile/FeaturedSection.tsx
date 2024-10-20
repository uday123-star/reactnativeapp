import * as React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MyAvatar } from '../MyAvatar';
import InfoCircle from '../../../assets/images/information.svg'
import { useAppDispatch, useIsGoldMember } from '../../../redux/hooks'
import { openModal } from '../../../redux/slices/my-profile/slice'
import { Colors } from '../../../styles/colors'
import { Menu, List } from 'react-native-paper'
import Icon from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useNavigation } from '@react-navigation/native'
import { useConfiguration } from '../../hooks';
import { getClassTitle } from '../../../redux/slices/current-affiliation/helpers';

interface Props {
  photoUrl: string|null
  creationDate?: Date
  thenPhotoUrl?: string|null
  firstName: string
  lastName: string
  schoolName: string
  endYear: string
  startYear: string
  isStudent: boolean
  onUploadPhoto?: (type: 'NOW'|'THEN') => void
}

export const FeaturedSection = ({ photoUrl, thenPhotoUrl = '', firstName, lastName, schoolName, endYear, startYear, isStudent, creationDate, onUploadPhoto }: Props) => {
  const { features: { isCmPlusFeaturesEnabled }} = useConfiguration();
  const isGold = useIsGoldMember();
  const dispatch = useAppDispatch();
  const classOfText = getClassTitle(String(endYear), isStudent, startYear, true);
  const memberSinceText = `Member since ${creationDate?.getFullYear()}`;

  const [visible, setVisible] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [ menuPosition, setMenuPosition ] = React.useState({
    x: 0,
    y: 0
  });

  const _getMemberShipText = () => {
    if (isGold) {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}>
          <Text style={{ fontSize: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>cm+ </Text>
            member</Text>
        </View>
      )
    } else {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}>
          <Text style={{ fontSize: 16 }}>Basic Member</Text>
          <TouchableOpacity
            onPress={() => dispatch(openModal())}
          >
            <InfoCircle style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      )
    }
  }

  const placeHolder = (type: 'NOW' | 'THEN') => (
    <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Colors.darkCyan
      }}
    >
      <Text style={{
        fontSize: 11,
        lineHeight: 11,
        marginTop: 5.5,
        fontWeight: '700',
        textAlign: 'center',
        color: Colors.whiteRGBA(),
      }}
      >{
        type === 'THEN' ? 'ADD THEN PHOTO' : 'ADD NOW PHOTO'
      }</Text>
    </View>
  )

  return (
    <View style={{ backgroundColor: '#BDE1E2', position: 'relative' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
        <MyAvatar
          photoUrl={photoUrl}
          namePlate={photoUrl?.length ? 'NOW' : ''}
          onPress={() => onUploadPhoto ? onUploadPhoto('NOW') : null}
          placeHolder={placeHolder('NOW')}
        />
        <Text>&nbsp;</Text>
        <MyAvatar
          photoUrl={thenPhotoUrl}
          namePlate={thenPhotoUrl?.length ? 'THEN' : ''}
          onPress={() => onUploadPhoto ? onUploadPhoto('THEN') : null}
          placeHolder={placeHolder('THEN')}
        />
      </View>
      <Text
        style={{ fontSize: 22, textAlign: 'center', marginBottom: 5 }}
        accessible={true}
        accessibilityRole='text'
        accessibilityLabel='Name'
      >{firstName} {lastName}</Text>
      <Text
        style={{ fontSize: 16, textAlign: 'center' }}
        accessible={true}
        accessibilityRole='text'
        accessibilityLabel='School Name'
      >{schoolName}</Text>
      <Text
        style={{ fontSize: 16, textAlign: 'center', marginBottom: 15 }}
        accessible={true}
        accessibilityRole='text'
        accessibilityLabel='Class Of'
      >{classOfText}</Text>
      {creationDate &&
        <Text
          style={{ fontSize: 16,
            marginBottom: 5,
            textAlign: 'center',
            paddingBottom: isCmPlusFeaturesEnabled ? 0 : 20
          }}
          accessible={true}
          accessibilityRole='text'
          accessibilityLabel='Member Since'
        >{memberSinceText}</Text>
      }
      {isCmPlusFeaturesEnabled && _getMemberShipText()}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 40,
          height: 40,
        }}
      >
        <Icon.Button name="dots-three-vertical"
          size={20}
          color={Colors.whiteRGBA()}
          backgroundColor={'transparent'}
          underlayColor={Colors.blackRGBA(0.01)}
          accessibilityLabel= 'vertical three dots'
          accessibilityRole='button'
          onPress={(event) => {
            const { nativeEvent } = event;
            setMenuPosition({
              x: nativeEvent.pageX,
              y: nativeEvent.pageY
            });
            openMenu();
          }}
          iconStyle={{
            padding: 0,
            margin: 0,
          }}
          style={{
            padding: 0,
            margin: 0,
            width: '100%',
            height: '100%',
            justifyContent: 'flex-end',
          }}
        />
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          style={{
            width: 150,
          }}
          anchor={menuPosition}
        >
          <List.Item onPress={() => {closeMenu();navigation.navigate('BlockedUsers')}}
            title="Blocked users"
            accessibilityLabel='blocked users'
            accessibilityRole='menuitem'
            left={
              () => (<AntDesign name='deleteusergroup'
                size={16}
                style={{
                  padding: 0, margin: 0, alignSelf: 'center'
                }}
              />)
            }
          />
        </Menu>
      </View>
    </View>
  )
}
