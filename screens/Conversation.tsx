import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ConversationsStackParamList } from '../types/types'
import { ConversationsProvider } from '../src/components/providers/providers'
import { ConversationContent } from '../src/components/conversations/ConversationContent'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_conversation'>

export const ConversationScreen = (props: Props) => {
  return (<ConversationsProvider>
    <ConversationContent {...props} />
  </ConversationsProvider>);
}
