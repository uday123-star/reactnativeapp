import { useContext } from 'react';
import { AppConfigData } from '../../data/queries/app/app-configuration';
import { AppContext, AppContextStructure } from '../helpers/contexts';

export const useConfiguration = (): AppConfigData => {
  const { appConfig } = useContext(AppContext) as AppContextStructure;
  return appConfig as AppConfigData
};
