import { useQuery } from '@apollo/client';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import React, { useState } from 'react';
import { AppConfigData, AppConfigResponse, GET_APP_CONFIG } from '../../../data/queries/app/app-configuration';
import { AppLoadingScreen } from '../../../screens';
import configuration, { APP_ENV } from '../../adapters/configuration';
import { initDDConfig } from '../../adapters/data-dog';
import { ConversationsContext, AppContext } from '../../helpers/contexts';

interface Props {
  children: JSX.Element
}

export const ConversationsProvider = ({ children }: Props) => {
  const [ scrollEnabled, setScrollEnabled ] = useState(true);
  const [ viewableId, setViewableId ] = useState('');
  return (<ConversationsContext.Provider
    value={{
      scrollEnabled,
      setScrollEnabled,
      viewableId,
      setViewableId
    }}
  >
    {children}
  </ConversationsContext.Provider>);
};

export const AppProvider = ({ children }: Props) => {
  const [ appConfig, setAppConfig ] = useState<AppConfigData | null>(null);

  const variables = {
    env: APP_ENV
  };
  const { loading: loadingAppConfig } = useQuery<AppConfigResponse>(GET_APP_CONFIG, {
    variables,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    onError: (error) => {
      DdRum.addError(
        error.message || 'error while fetching app config',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          error,
          variables
        },
        Date.now()
      )
    },
    onCompleted: (data) => {
      if (data?.appConfig) {
        const { dataDogConfig } = data.appConfig;
        if (dataDogConfig.enabled) {
          initDDConfig({
            nativeCrashReportEnabled: dataDogConfig.nativeCrashReport,
            sessionSamplingRate: dataDogConfig.sessionSamplingRate,
            resourceTracingSamplingRate: dataDogConfig.resourceTracingSamplingRate
          })
        }
        setAppConfig({
          ...data.appConfig,
          apiUrl: configuration.apiUrl,
        });
      }
    }
  });

  if (loadingAppConfig || appConfig === null) {
    return <AppLoadingScreen />
  }

  return (<AppContext.Provider
    value={{
      appConfig
    }}
  >
    {children}
  </AppContext.Provider>);
};
