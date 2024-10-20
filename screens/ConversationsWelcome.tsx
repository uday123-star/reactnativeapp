import * as React from 'react'
import { Screens } from '../src/helpers/screens'
import { Button } from '../src/components/Button'
import { ScrollView } from 'react-native-gesture-handler'
import { Colors } from '../styles/colors'
import { Text } from '../src/components/Text'
import { globalStyles } from '../styles/global-stylesheet'
import TalkBubbles from '../assets/images/talkbubbles_welcome.svg'
import { ConversationsStackParamList } from '../types/types'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useDispatch } from 'react-redux'
import { hasSeenWelcomeScreen } from '../redux/slices/conversations/slice'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_welcome'>

export const ConversationsWelcomeScreen = ({ navigation }: Props) => {

  const screens = new Screens();
  const dispatch = useDispatch();

  const navigateToConversations = () => {
    dispatch(hasSeenWelcomeScreen());
    navigation.navigate('_feed')
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.purple }}
      contentContainerStyle={[globalStyles.container, { backgroundColor: Colors.purple, padding: 20, marginBottom: screens.getHeaderHeight() }]}
      scrollIndicatorInsets={{ right: 1 }}
    >

      <Text
        isBold
        isCentered
        style={{ color: Colors.whiteRGBA(), fontSize: 40 }}
      >
        Welcome to Conversations
      </Text>

      <Text
        fontSizePreset={2}
        isCentered
        style={{ color: Colors.whiteRGBA(), marginVertical: 10 }}
      >
        A fun way to re-connect with your&nbsp;schoolmates.
      </Text>

      <TalkBubbles
        style={{
          marginVertical: 30
        }}
      />

      <Text
        isCentered
        style={{ color: Colors.whiteRGBA(), paddingHorizontal: 20 }}
      >
        Share your favorite stories about high school, or just let your schoolmates know what you&apos;re up to.
      </Text>

      <Button
        style={{ marginVertical: 30, padding: 20 }}
        onPress={navigateToConversations}
        title="Let&apos;s go!"
        isPartialWidth={true}
        backgroundColor={Colors.darkCyan}
        borderRadius={50}
        accessibilityLabel='let&apos;s Go!'
        accessible={false}
      />
    </ScrollView>
  )
}
