/* eslint-disable  @typescript-eslint/no-explicit-any */
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import core from './slices/core/slice'
import conversations from './slices/conversations/slice'
import allAffiliations from './slices/all-affiliations/slice'
import currentAffiliation from './slices/current-affiliation/slice'
import currentUser from './slices/current-user/slice'
import profileCarousel from './slices/profile-carousel/slice'
import featureCarousel from './slices/feature-carousel/slice'
import profileVisits from './slices/profile-visits/slice'
import visits from './slices/visits/slice'
import signIn from './slices/sign-in/slice'
import classPhotos from './slices/photos-class/slice'
import { persistStore, persistReducer, createMigrate } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import thunkMiddleware from 'redux-thunk'
import myProfile from './slices/my-profile/slice'
import albumsSlice from './slices/albums/slice'
import albumPhotosSlice from './slices/photos/slice'
import appConfig from './slices/app-configuration/slice'
import migration from './migration/index';
import currentScreen from './slices/screens/slice'
import WeebleColors from './slices/weeble-colors/slice'
import { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux'

const combinedReducer = combineReducers({
  core,
  conversations,
  currentUser,
  allAffiliations,
  currentAffiliation,
  profileCarousel,
  featureCarousel,
  profileVisits,
  visits,
  signIn,
  classPhotos,
  myProfile,
  albumsSlice,
  albumPhotosSlice,
  appConfig,
  currentScreen,
  WeebleColors
});

type combinedReducerType = typeof combinedReducer;

const rootReducer: combinedReducerType = (state, action) => {

  // this is the block where we mutate
  // state a during signout action
  if (action.type === 'currentUser/signOut') {

    // create a new state to the existing state object
    // or fall back to an empty object
    const newState: Partial<RootState> = state || {};

    // List all slices below
    // Setting a slice to undefined will flush its state
    //
    // Comment out any slice that we should preserve
    // when a user signs out.
    // @see https://stackoverflow.com/a/37540529/513408
    newState['allAffiliations'] = undefined;
    newState['albumPhotosSlice'] = undefined;
    newState['albumsSlice'] = undefined;
    newState['classPhotos'] = undefined;
    // newState['core'] = undefined;    // userAgent and eula agreement should be preserved
    newState['currentAffiliation'] = undefined;
    newState['currentUser'] = undefined;
    newState['featureCarousel'] = undefined;
    newState['myProfile'] = undefined;
    newState['profileCarousel'] = undefined;
    newState['profileVisits'] = undefined;
    newState['signIn'] = undefined;
    newState['visits'] = undefined;

    return combinedReducer(newState as RootState, action);
  }
  return combinedReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  /**
   * To disable persistent storage for the reducer, include in this array.
   * classListHeader: Related to searching students in classlist
   */
  blacklist: [
    'classListHeader',
    'albumsSlice',
    'albumPhotosSlice',
    'citySelection',
    'stateSelection'
  ],
  version: 9,
  migrate: createMigrate(migration, {
    debug: true
  })
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,

  // keep the warnings, and adjust for large states as per https://stackoverflow.com/a/69624806/513408
  // for more info see https://redux-toolkit.js.org/api/serializabilityMiddleware
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: false
    }).concat(thunkMiddleware);
  },
});
// // Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>;

export const useAppThunkDispatch = () => useDispatch<ThunkAppDispatch>();

export default store;
