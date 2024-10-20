import { createSlice } from '@reduxjs/toolkit';
import { AppConfigData } from '../../../data/queries/app/app-configuration';

export enum AppConfigState {
  LOADING,
  EMPTY,
  READY,
  ERROR
}

const initialState: AppConfigData & {
  appConfigState: AppConfigState
} = {
  appConfigState: AppConfigState.EMPTY,
  android: {
    minVersion: 0
  },
  ios: {
    minVersion: ''
  },
  features: {
    isCmPlusFeaturesEnabled: false,
    isProfileVisitsEnabled: false,
    isPhotoUploadEnabled: false,
    isYearbooksEnabled: false,
    isConversationsEnabled: true,
  },
  conversations: {
    pollInterval: 30000
  },
  commerceUrl: '',
  mobilePasswordResetUrl: '',
  privacyPolicyUrl: '',
  termsOfServiceUrl: '',
  dataDogConfig: {
    enabled: false,
    nativeCrashReport: false,
    jsCrashReport: false,
    shouldReportNonFatalErrors: false,
    screenView: false,
    sessionSamplingRate: 0,
    resourceTracingSamplingRate: 0,
    shouldLogActions: false,
  }
};

const AppConfig = createSlice({
  name: 'AppConfig',
  initialState,
  reducers: {
    setAppConfig(state, { payload }: {
      payload: AppConfigData
    }) {
      state = {
        ...payload,
        appConfigState: AppConfigState.READY
      };
      return state
    },
    setAppConfigState(state, { payload }: {
      payload: AppConfigState
    }) {
      state = {
        ...(state || {}),
        appConfigState: payload
      };
      return state
    },
  },
});

export const { setAppConfig, setAppConfigState } = AppConfig.actions;

export default AppConfig.reducer;
