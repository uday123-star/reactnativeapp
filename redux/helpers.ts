import store from './store'

export const getCurrentUser = () => {
  const state = store.getState();
  return state.myProfile.currentUser;
}

export const getCurrentUserId = () => {
  const state = store.getState();
  return state.myProfile.currentUser.personId;
}

export const getMyProfile = () => {
  const state = store.getState();
  return state.myProfile;
}
