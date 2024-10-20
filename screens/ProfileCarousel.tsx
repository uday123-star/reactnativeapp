import React from 'react';
import { SafeAreaView } from 'react-native';
import { ProfileCarousel } from '../src/components/carousels/profile/ProfileCarousel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClasslistStackParamList } from '../types/types';
import { useFocusedStatus } from '../src/hooks';

type Props = NativeStackScreenProps<ClasslistStackParamList, '_carousel'>

export const ProfileCarouselScreen = ({ route, navigation }: Props): JSX.Element => {
  useFocusedStatus(navigation, route, false);
  const { studentId, students: sortedStudents } = route.params;
  const firstItem = sortedStudents.findIndex(student => student.id === studentId || student.personId === studentId);

  // These links were necessary for understanding, and implementing FlashList / carousel
  // functionality. Getting the first item to display was buggy, mysterious and challenging.
  // Change at your own risk !!
  // @see https://dev.to/lloyds-digital/let-s-create-a-carousel-in-react-native-4ae2
  // @see https://github.com/meliorence/react-native-snap-carousel
  // @see https://github.com/meliorence/react-native-snap-carousel/issues/538
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10, }}>
      <ProfileCarousel
        sortedStudents={sortedStudents}
        firstItem={firstItem}
        studentId={studentId}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
