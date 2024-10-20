import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableHighlight, RefreshControl } from 'react-native';
import { Card, ListItem } from 'react-native-elements';
import { MyAvatar } from '../src/components/MyAvatar';
import { useCurrentAffiliation, useCurrentUser } from '../redux/hooks';
import { globalStyles } from '../styles/global-stylesheet';
import { AffiliationDropdown } from '../src/components/AffiliationDropdown';
import { useHeaderHeight } from '@react-navigation/elements';
import { Screens } from '../src/helpers/screens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { refetchAllAffiliationThunk, refetchPartialProfileThunk } from '../redux/slices/my-profile/thunks';
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator';
import { FeaturedCarouselModule } from '../src/components/modules/FeaturedCarousel';
import { ConversationsModule } from '../src/components/modules/Conversations';
import { useAppThunkDispatch } from '../redux/store';
import { NewMembersModule } from '../src/components/modules/NewMembersModule';
import { FeaturedPhotosModule } from '../src/components/modules/FeaturedPhotosModule';
import { PhotoUploadProgressBar } from '../src/components/photos/PhotoUploadProgressBar';
import { useAffiliationYearRange, useConfiguration } from '../src/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export const HomeScreen = ({ navigation }: Props): JSX.Element => {
  const thunkDispatch = useAppThunkDispatch();
  const { isConversationsEnabled } = useConfiguration().features;
  const currentAffiliation = useCurrentAffiliation();
  const { range: yearRange ,end: endYear, isStudent, start: startYear } = useAffiliationYearRange();
  const [ isRefreshing, setIsRefreshing ] = useState(false);
  const currentUser = useCurrentUser(isRefreshing);

  const screens = new Screens();
  screens.setHeaderHeight(useHeaderHeight());

  const refreshCurrentUser = async () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    await Promise.all([
      thunkDispatch(refetchPartialProfileThunk({ id: currentUser.id, type: 'MEDIUM' })),
      thunkDispatch(refetchAllAffiliationThunk()),
    ]).then(() => {
      setIsRefreshing(false);
    })
  }

  useEffect(() => {
    refreshCurrentUser();
  }, [])

  if (!currentAffiliation || currentAffiliation.id === '') {
    return (<ScreenLoadingIndicator />);
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshCurrentUser} />}
        scrollIndicatorInsets={{ right: 1 }}
      >

        {/* My Info Card */}
        <Card containerStyle={{ marginBottom: 20 }}>
          <View>
            <ListItem
              accessibilityLabel='View my profile'
              accessible={true}
              accessibilityRole='none'
              Component={TouchableHighlight}
              disabledStyle={{ opacity: 0.5 }}
              onPress={() => {
                navigation.navigate('MyProfile', { screen: '_myProfileRoot' })
              }}
              pad={20}
              hasTVPreferredFocus={undefined}
              tvParallaxProperties={undefined}
            >
              <MyAvatar photoUrl={currentUser.nowPhoto?.display?.url || currentUser.thenPhoto?.display?.url || ''} />
              <ListItem.Content>
                <ListItem.Title>
                  <Text style={{ fontWeight: 'bold' }}>{currentUser.firstName} {currentUser.lastName}</Text>
                </ListItem.Title>
                <ListItem.Subtitle>
                  <Text style={globalStyles.linkColor}>View My Profile</Text>
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          </View>
        </Card>

        {/* Affiliation Dropdown Section */}
        <AffiliationDropdown
          showSchoolName={true}
          showSchoolLocation={true}
        />

        <FeaturedCarouselModule />

        {Boolean(isConversationsEnabled) && <ConversationsModule />}

        {/* New Members Section */}
        <NewMembersModule
          currentAffiliation={currentAffiliation}
          currentUserId={currentUser.personId}
          endYear={endYear}
          yearRange={yearRange}
          isStudent={isStudent}
          startYear={startYear}
        />

        {/* Featured Photo */}
        <FeaturedPhotosModule />
      </ScrollView>
      <PhotoUploadProgressBar />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
