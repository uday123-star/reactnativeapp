import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

enum AppEnvironments {
  PRODUCTION='PRODUCTION',
  DEVELOPMENT='DEVELOPMENT',
  STAGING='STAGING',
}

export interface AppConfigArgs {
  env: AppEnvironments
}

export interface AppConfigData {
  apiUrl: string
  android: {
    minVersion: number
  }
  ios: {
    minVersion: string
  }
  features: {
    isCmPlusFeaturesEnabled: boolean
    isProfileVisitsEnabled: boolean
    isPhotoUploadEnabled: boolean
    isConversationsEnabled: boolean
    isYearbooksEnabled: boolean
  }
  conversations: {
    pollInterval: number
  }
  commerceUrl: string
  mobilePasswordResetUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  dataDogConfig: {
    enabled: boolean
    nativeCrashReport: boolean
    jsCrashReport: boolean
    shouldReportNonFatalErrors: boolean
    screenView: boolean
    shouldLogActions: boolean
    sessionSamplingRate: number
    resourceTracingSamplingRate: number
  }
}

export interface AppConfigResponse {
  appConfig: AppConfigData
}

export const GET_APP_CONFIG = gql`
query ${QUERY_PREFIX}getAppConfig($env: AppEnvironments) {
  appConfig(environment: $env) {
    android {
      minVersion
    }
    ios {
      minVersion
    }
    conversations {
      pollInterval
    }
    features {
      isCmPlusFeaturesEnabled
      isProfileVisitsEnabled
      isPhotoUploadEnabled
      isConversationsEnabled
    }
    commerceUrl
    mobilePasswordResetUrl
    privacyPolicyUrl
    termsOfServiceUrl
    dataDogConfig {
      enabled
      nativeCrashReport
      jsCrashReport
      shouldReportNonFatalErrors
      screenView
      sessionSamplingRate
      resourceTracingSamplingRate
    }
  }
}
`;

