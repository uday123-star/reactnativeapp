import store from '../../redux/store';

export const getSessionData = () => {
  const state = store.getState();
  const { currentUser, myProfile, currentAffiliation, currentScreen } = state;
  const userData = {
    id: '',
    membershipState: '',
  };
  const affiliationData = {
    id: '',
  };
  const screenData = {
    name: '',
    params: {},
  }

  if (currentUser.isSignedIn) {
    const user = myProfile.currentUser;
    userData.id = user.id;
    userData.membershipState = user.membershipState;
    affiliationData.id = currentAffiliation.currentAffiliation.id;
    const screen = currentScreen;
    screenData.name = screen.name;
    screenData.params = screen.params;
  }
  return {
    user: userData,
    currentAffiliation: affiliationData.id,
    screen: screenData
  };
}
