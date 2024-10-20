import { CurrentUser } from '../../../types/interfaces';
interface AuthHeader {
  Authorization: string
}

export function buildAuthHeader(token: string): AuthHeader {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const getEmptyCurrentUser = (): CurrentUser => {
  return {
    id: '',
    personId: '',
    firstName: '',
    lastName: '',
    creationDate: new Date(),
    birthDate: '',
    currentCity: '',
    currentState: '',
    source: 0,
    stories: [{
      id: '',
      owner: '',
      text: '',
    }],
    membershipState: '',
    affiliations: [],
    settings: {
      privacy: {
        activityFeedOptIn: false,
        allowExtAccess: false,
        autoPublishNotes: false,
        btdtOptIn: false,
        etag: '',
        fbPhotoShareOptIn: false,
        fbPhotoSyncEnabled: false,
        featureBioInEmails: false,
        mapsOptIn: false,
        meetNewPeople: false,
        personId: '',
        publicSearch: false,
        researchParticipant: false,
        shareBirthday: false,
        hasBirthdateAvailable: false,
      }
    },
    primaryAffiliation: {
      schoolId: '',
      schoolName: '',
      schoolCity: '',
      schoolState: '',
      endYear: '',
      gradYear: '',
    },
    visits: {
      totalCount: 0,
      namedCount: 0,
      newCount: 0,
    },
    nowPhoto: {
      id: '',
        display: {
        url: '',
        width: '',
        height: '',
      },
      albumName: '',
      albumType: '',
      createdBy: ''
    },
    thenPhoto: {
      id: '',
        display: {
        url: '',
          width: '',
          height: '',
      }
    }
  }
}
