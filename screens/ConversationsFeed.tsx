import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { ConversationsStackParamList } from '../types/types'
import { useFocusedStatus } from '../src/hooks'
import { ConversationsProvider } from '../src/components/providers/providers'
import { ConversationsFeedContent } from '../src/components/conversations/ConversationsFeedContent'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_feed'>

export const ConversationsFeedPage = ({ navigation, route }: Props) => {
  useFocusedStatus(navigation, route, false);
  return (<ConversationsProvider>
    <ConversationsFeedContent />
  </ConversationsProvider>)
}
