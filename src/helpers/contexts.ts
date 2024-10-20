import React, { createContext } from 'react';
import { AppConfigData } from '../../data/queries/app/app-configuration';

export type ConversationsContextStructure = {
  scrollEnabled: boolean
  setScrollEnabled: React.Dispatch<boolean>
  viewableId: string
  setViewableId: React.Dispatch<string>
};

export const ConversationsContext = createContext<ConversationsContextStructure | null>(null);

export type AppContextStructure = {
  appConfig: AppConfigData | null
};

export const AppContext = createContext<AppContextStructure | null>(null);
