import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { WebView } from 'react-native-webview';
import { ConversationsStackParamList } from '../types/types';

type Props = NativeStackScreenProps<ConversationsStackParamList, '_help'>

export const HelpScreen = ({ route }: Props): JSX.Element => {
  const { ticket_form_id } = route.params;
  return (
    <WebView source={{ uri: `https://help.classmates.com/hc/en-us/requests/new${ticket_form_id ? `?ticket_form_id=${ticket_form_id}` : ''}` }} startInLoadingState={true} />
  )
}
