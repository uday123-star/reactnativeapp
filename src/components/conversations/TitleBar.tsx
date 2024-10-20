import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { View } from 'react-native'
import { useCurrentAffiliation } from '../../../redux/hooks'
import { TitleBar as BaseTitleBar } from '../TitleBar'
import { Text } from '../Text'
import InfoCircle from '../../../assets/images/info-circle-orange.svg'
import { ConversationsStackParamList } from '../../../types/types'
import { StackNavigationProp } from '@react-navigation/stack'

export const TitleBar = () => {
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const { schoolName } = useCurrentAffiliation();
  return (
    <BaseTitleBar>
      <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'column' }}>
          <Text
            fontSizePreset={2}
            isBold
            textWhite
          >Conversations</Text>
          <Text textWhite>{schoolName}</Text>
        </View>
        <View style={{ display: 'flex', justifyContent: 'center' }}>
          <InfoCircle onPress={() => navigation.navigate('_info')} />
        </View>
      </View>
    </BaseTitleBar>
  )
}
