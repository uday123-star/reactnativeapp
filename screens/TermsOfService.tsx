import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { WebView } from 'react-native-webview';
import { useConfiguration } from '../src/hooks';
import { ConversationsStackParamList, RootStackParamList } from '../types/types';

type Props = NativeStackScreenProps<(RootStackParamList | ConversationsStackParamList), '_tos'>

export const TermsOfServiceScreen = ({ route }: Props): JSX.Element => {
  const { params = {}} = route;
  const { section = '' } = params;
  const { termsOfServiceUrl } = useConfiguration();

  return (
    <WebView source={{ uri: `${termsOfServiceUrl}${section}` }} startInLoadingState={true} />
  )
}
