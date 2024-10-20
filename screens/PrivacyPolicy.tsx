import React from 'react';
import { WebView } from 'react-native-webview';
import { useConfiguration } from '../src/hooks';

export const PrivacyPolicyScreen = (): JSX.Element => {
  const { privacyPolicyUrl } = useConfiguration();
  return (
    <WebView source={{ uri: privacyPolicyUrl }} startInLoadingState={true} />
  )
}
