import * as React from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import { Colors } from '../../../styles/colors'
import { Text } from '../Text'

type Tab = 0|1|2

interface Props {
  likesCount: number
  heartsCount: number
  smilesCount: number
  containerStyles?: StyleProp<ViewStyle>
  onPress(tab: Tab): void
}

export const ReactionDisplay = ({ likesCount = 0, heartsCount = 0, smilesCount = 0, containerStyles, onPress }: Props) => {

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }, containerStyles]}>
      {!!(likesCount) && (
        <Pressable onPress={() => onPress(0)}>
          <AntDesignIcon
            size={20}
            name='like1'
            color={Colors.darkCyan}
          />
        </Pressable>
      )}
      {!!(heartsCount) && (
        <Pressable onPress={() => onPress(1)}>
          <AntDesignIcon
            size={20}
            name='heart'
            color={Colors.darkCyan}
          />
        </Pressable>
      )}
      {!!(smilesCount) && (
        <Pressable onPress={() => onPress(2)}>
          <AntDesignIcon
            size={20}
            name='smile-circle'
            color={Colors.darkCyan}
          />
        </Pressable>
      )}
      <Text style={{ color: Colors.darkCyan, marginLeft: 5 }}>{likesCount + heartsCount + smilesCount}</Text>
    </View>
  )
}
