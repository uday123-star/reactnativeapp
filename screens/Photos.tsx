import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCurrentAffiliation, useCurrentUserId } from '../redux/hooks';
import { getClassTitle } from '../redux/slices/current-affiliation/helpers';
import { PhotosStackParamList } from '../types/types';
import { PhotosFilter, PhotosVisibleState } from '../data/queries/photos/photos';
import { AlbumType } from '../data/queries/photos/albums';
import { refetchPartialProfileThunk } from '../redux/slices/my-profile/thunks';
import { useFocusedStatus } from '../src/hooks/onFocus';
import { useAppThunkDispatch } from '../redux/store';
import { AffiliationDropdown } from '../src/components/AffiliationDropdown';
import { useAffiliationYearRange } from '../src/hooks';

type Props = NativeStackScreenProps<PhotosStackParamList, '_photos'>

export const PhotosScreen = ({ navigation, route }: Props): JSX.Element => {
  const isFocused = useFocusedStatus(navigation, route);
  const currentAffiliation = useCurrentAffiliation();
  const { end: endYear, years, isStudent } = useAffiliationYearRange();
  const gradYear = endYear;
  const schoolId = currentAffiliation.schoolId;
  const currentUserId = useCurrentUserId();
  const thunkDispatch = useAppThunkDispatch();

  React.useEffect(() => {
    if (isFocused) {
      thunkDispatch(refetchPartialProfileThunk({ id: currentUserId, type: 'BASIC' }));
    }
  }, [isFocused]);

  const _navigateToCollage = (year: string) => {
    const filters: PhotosFilter = {
      albumTypes: [ AlbumType.COMMUNITY_ALBUM, AlbumType.PERSONAL_ALBUM, AlbumType.NOW_PHOTOS, AlbumType.THEN_PHOTOS, AlbumType.FACEBOOK_PHOTOS],
      visibleStates: [PhotosVisibleState.VISIBLE]
    };
    navigation.navigate('_photoCollage', {
      year,
      schoolId: schoolId,
      classId: currentAffiliation.classId,
      filters,
      limit: 100,
      offset: 0,
    });
  }

  const _classButton = (year: string, index = 0) => {
    return (<TouchableOpacity key={`${index}-${year}`}
      onPress={() => _navigateToCollage(year)}
      accessibilityLabel='Photos of Class year'
      accessibilityRole='button'
    >
      <Card containerStyle={{ borderRadius: 10 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>
          <Icon.Button name="camera"
            size={28}
            color={'black'}
            backgroundColor={'transparent'}
            iconStyle={{ marginTop: -7, marginRight: -3 }}
          />
          <Text
            style={{ fontWeight: 'bold', fontSize: 22 }}
          >
            {`${getClassTitle(year)} Photos`}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <AffiliationDropdown
          title='Photos'
          showSchoolName={true}
        />

        {/* need to pass the year to Photo Collage page */}
        {Boolean(isStudent) && _classButton(gradYear)}
        {Boolean(!isStudent) && years.map((year, index) => _classButton(year, index))}
        {
          // TODO: Define how we should get the info for a range of years.
        }
        {/* <TouchableOpacity onPress={_navigateToCollage}>
          <Card containerStyle={{ borderRadius: 10 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>
              <Icon.Button name="camera"
                size={28}
                color={'black'}
                backgroundColor={'transparent'}
                iconStyle={{ marginTop: -7, marginRight: -3 }}
              />
              <Text
                style={{ fontWeight: 'bold', fontSize: 22 }}
              >
                {`${getYearsAttendedTitle(startYear, endYear)} Photos`}
              </Text>
            </View>
          </Card>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}
