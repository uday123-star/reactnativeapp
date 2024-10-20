import { Affiliation } from '../data/queries/affiliations/fetch-all-affiliations'

export interface Display {
  url: string
  height: string
  width: string
}

export interface PersonModel {
  id: string
  personId: string
  firstName: string
  lastName: string
  birthDate: string
  birthDateConfidenceLevel: BirthDateConfidenceLevel
  nowPhoto?: Partial<Photo>
  thenPhoto?: Partial<Photo>
  photos?: Photo[]
}

export interface StudentModel extends PersonModel {
  gradYear?: string
  schoolId?: string
  school?: {
    schoolName: string
  }
  visits: VisitsReceivedInfo
  hasBirthdateAvailable: boolean
  isBlocked?: boolean
}

export interface UserModel extends StudentModel {
  email?: string
  affiliations?: AffiliationModel[]
  primaryAffiliation?: Partial<AffiliationModel>
  isBlocked?: boolean
}

export enum BirthDateConfidenceLevel {
  NOT_SET = -1,
  UNKNOWN = 0,
  FULL = 1,
  PARTIAL = 2,
  UPDATING = 999
}

export interface CurrentUser extends UserModel {
  creationDate: Date
  membershipState: string
  affiliations: Affiliation[]
  settings: {
    privacy: PrivacySettings
  }
  source: number
  stories: Story[]
  birthDate: string
  birthDateConfidenceLevel: BirthDateConfidenceLevel
  currentCity: string
  currentState: string
  nowPhoto: Photo
}

export interface Story {
  id: string
  owner: string
  text: string
  visibleState: StoryVisibleState
}

export interface Photo {
  id: string
  albumName: string
  albumType: string
  createdBy: string
  createdByPerson?: PersonModel
  display?: Display
  thumbnail?: Display
  visibleState?: string
}
export interface AffiliationModel {
  id: string
  firstName: string
  lastName: string
  schoolId: string
  schoolName: string
  startYear: string
  endYear: string
  gradYear: string
  city?: string
  state?: string
  primary: boolean
  students?: StudentModel[]
  schoolCity: string
  schoolState: string
  classId?: string
  studentInfo: number
  role: string
}

export interface AffiliationDetails extends AffiliationModel {
  id: string
  firstName: string
  lastName: string
  schoolId: string
  schoolName: string
  startYear: string
  endYear: string
  gradYear: string
  role: string
}

export interface VisitModel {
  id: string
  schoolName: string
  visitorImage: string
}

export interface RemoveVisitArgs {
  visiteeId: string
}

export enum VisitTypeEnum {
  anonymous = 'ANONYMOUS',
  normal = 'NORMAL',
  permanent = 'PERMANENT',
  deleted = 'DELETED',
}

export type VisitOrigin = 'profile:people'|'carousel:home'|'photo_carousel:photos';
export interface VisitsResponse {
  id: string
  visitDate: string
  visitOrigin: VisitOrigin
  visitType: VisitTypeEnum
  visitorId: string
  visiteeId: string
  canUpdate: boolean
  isModalVisible?: boolean
  isLoading?: boolean
  isQuietMode?: boolean
  shouldLogEvent: boolean
}

export interface DeleteVisitsResponse {
  deleteVisit: Partial<VisitsResponse>
}

export interface VisitsReceivedInfo {
  namedCount: number
  totalCount: number
  newCount: number
}

export interface PrivacySettings {
  activityFeedOptIn: boolean
  allowExtAccess: boolean
  autoPublishNotes: boolean
  btdtOptIn: boolean
  etag: string
  fbPhotoShareOptIn: boolean
  fbPhotoSyncEnabled: boolean
  featureBioInEmails: boolean
  mapsOptIn: boolean
  meetNewPeople: boolean
  personId: string
  publicSearch: boolean
  researchParticipant: boolean
  shareBirthday: boolean
  hasBirthdateAvailable: boolean
}

export interface AlbumModel {
  id: string
  type: string
  name: string
  description: string
  createdBy: string
  ownerId: string
  ownerType: string
  creationDate: string
  lastModifiedDate: string
  coverPhoto: Photo
}

export enum StoryVisibleState {
  VISIBLE = 'VISIBLE',
  RUDE = 'RUDE',
  INAPPROPRIATE = 'INAPPROPRIATE',
  MC_APPROVED = 'MC_APPROVED',
  MC_HIDDEN = 'MC_HIDDEN',
  DELETED = 'DELETED',
  IN_PROCESS = 'IN_PROCESS',
  MC_DELETED = 'MC_DELETED',
  OWNER_DELETED = 'OWNER_DELETED',
}

export interface ConversationFeedVariables {
  gradYear?: number
  yearRange?: string
  schoolId: string
  limit: number
  offset: number
  lastId?: string
}
