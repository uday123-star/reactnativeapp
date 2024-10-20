import { gql } from '@apollo/client';
import { PrivacySettings } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';

export interface UpdateBioOptInArgs {
  featureBioInEmails: boolean
}

export interface UpdateBioOptInResponse {
  updatePrivacySettings: PrivacySettings
}

export const UPDATE_BIO_OPT_IN = gql`
mutation ${QUERY_PREFIX}updatePrivacySettings($featureBioInEmails:Boolean!) {
  updatePrivacySettings(featureBioInEmails:$featureBioInEmails) {
    activityFeedOptIn
    allowExtAccess
    autoPublishNotes
    btdtOptIn
    etag
    fbPhotoShareOptIn
    fbPhotoSyncEnabled
    featureBioInEmails
    mapsOptIn
    meetNewPeople
    personId
    publicSearch
    researchParticipant
    shareBirthday
    showBirthdayOnProfile
  }
}
`
