/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { classPhotoSelector } from './slices/photos-class/slice'
import type { RootState } from './store'
import { profileVisitsSelectors } from './slices/profile-visits/slice'
import { affiliationsSelectors } from './slices/all-affiliations/slice'
import { Screens } from '../src/helpers/screens'
import { useMemo } from 'react'
import { getCurrentUser, getCurrentUserId, getMyProfile } from './helpers'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useIsGoldMember = () => useAppSelector(state => state.myProfile.currentUser.membershipState.toUpperCase() === 'GOLD')

export const useSignInForm = () => useAppSelector(state => {
  const { email, password, visitorId, hasError } = state.signIn;
  return {
    email,
    password,
    visitorId,
    hasError
  }
});

export function useFeatureCarouselItems() {
  return useAppSelector(state => {
    return {
      items: state.featureCarousel.featuredMembers,
      carouselState: state.featureCarousel.carouselState
    }
  })
}

export const useHasSeenConversationsWelcomeScreen = () => useAppSelector(state => state.conversations.hasSeenWelcomeScreen)
export const useHasSeenTrackingScreen = () => useAppSelector(state => state.core.hasSeenTrackingScreen);
export const useHasAcceptedEULA = () => useAppSelector(state => state.core.hasAcceptedEULA);
export const useCurrentAffiliation = () => useAppSelector(state => state.currentAffiliation.currentAffiliation);
export const useAllAffiliations = () => useAppSelector(state => affiliationsSelectors.selectAll(state.allAffiliations));
export const useAllProfileVisits = () => useAppSelector(state => profileVisitsSelectors.selectAll(state.profileVisits));
export const useCurrentUser = (...deps: any) => useMemo(() => getCurrentUser(), [...deps]);
export const useCurrentUserId = (...deps: any) => useMemo(() => getCurrentUserId(), [...deps]);
export const useMyProfile = (...deps: any) => useMemo(() => getMyProfile(), [...deps]);
export const useIsSignedIn = (studentId: string) => useAppSelector(state => String(state.myProfile.currentUser.id) === String(studentId));

// TODO: better naming convention? Also need to pull in the correct id rather than hardcoded 1
export const useClassPhotos = () => useAppSelector(state => classPhotoSelector.selectAll(state.classPhotos))
export const useFirstClassPhoto = () => useAppSelector(state => classPhotoSelector.selectAll(state.classPhotos)[0])

export const useScreenSize = () => {
  const screens = new Screens();
  return {
    width: screens.width,
    height: screens.height,
    heightNoHeader: screens.height - screens.getHeaderHeight()
  }
}

export const useWeebleColor = (registrationId: string) => useAppSelector(state => state.WeebleColors[registrationId] || undefined);
