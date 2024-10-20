import React, { useEffect } from 'react'
import { BaseModule } from './Base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-elements';
import { Button } from '../Button';
import { useQuery, useReactiveVar } from '@apollo/client';
import { NewStudentsResponse, NEW_STUDENTS, NEW_STUDENTS_BY_SCHOOL_AND_YEAR, StudentsInfoResponse, STUDENTS_INFO } from '../../../data/queries/students/students';
import { getClassCountString, getClassTitle } from '../../../redux/slices/current-affiliation/helpers';
import { ActivityIndicator, Share, View } from 'react-native';
import { Text } from '../Text';
import { globalStyles } from '../../../styles/global-stylesheet';
import { Colors } from '../../../styles/colors';
import UserListItem from '../UserListItem';
import { DrawerActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/types';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { getSessionData } from '../../helpers/session';
import { AffiliationModel } from '../../../types/interfaces';
import { shouldRefreshNewMembersModule } from '../../adapters/apollo-client.adapter';

interface Props {
  currentAffiliation: AffiliationModel
  currentUserId: string
  endYear: string
  yearRange: string
  startYear: string
  isStudent: boolean
}

export const NewMembersModule = ({ currentAffiliation, currentUserId, endYear, yearRange, isStudent, startYear }: Props) => {
  const navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> = useNavigation();
  const { schoolId, id: currentAffiliationId } = currentAffiliation;
  const pollInterval = 60000;
  const focused = useIsFocused();
  const shouldRefresh = useReactiveVar(shouldRefreshNewMembersModule);

  const infoVariables = {
    schoolId: String(schoolId),
    year: isStudent ? endYear : yearRange,
    affiliationAge: 'ALL'
  };

  const listVariables = isStudent ? {
    affiliationId: String(currentAffiliationId),
    limit: 10,
    offset: 0
  } : {
    schoolId: schoolId,
    year: yearRange,
    limit: 3,
    offset: 0
  }

  const { data: studentsInfoData, loading: loadingStudentsInfo } = useQuery<StudentsInfoResponse>(STUDENTS_INFO, {
    variables: infoVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    onError: (error) => {
      const session = getSessionData();
      DdRum.addError(
        error.message || 'Loading New Members Module',
        ErrorSource.SOURCE,
        error.stack || __filename + '::Error fetching students info',
        {
          variables: infoVariables,
          session
        },
        Date.now()
      )
    }
  });
  const {
    data: newStudentsData,
    loading: loadingNewStudents,
    startPolling: startPollingList,
    stopPolling: stopPollingList,
    refetch
  } = useQuery<NewStudentsResponse>(isStudent ? NEW_STUDENTS : NEW_STUDENTS_BY_SCHOOL_AND_YEAR, {
    variables: listVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    onError: (error) => {
      const session = getSessionData();
      DdRum.addError(
        error.message || 'Loading New Members Module',
        ErrorSource.SOURCE,
        error.stack || __filename + '::Error fetching students list',
        {
          variables: listVariables,
          session
        },
        Date.now()
      )
    }
  });

  useEffect(() => {
    return () => {
      stopPollingList();
    }
  }, []);

  useEffect(() => {
    if (focused) {
      startPollingList(pollInterval);
      if (shouldRefresh) {
        refetch();
        shouldRefreshNewMembersModule(false);
      }
    } else {
      stopPollingList();
    }
  }, [focused, shouldRefresh]);


  const isLoading = loadingStudentsInfo || loadingNewStudents

  if (isLoading) {
    return (
      <BaseModule
        icon={<Icon.Button name='graduation-cap'
          size={28}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -7, marginRight: 0 }}
        />}
        heading="New People"
      >
        <Card>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <ActivityIndicator
              color={Colors.cyan}
              style={{
                width: 40,
                height: 40
              }}
            />
          </View>
        </Card>
      </BaseModule>
    )
  }
  const studentsArray = newStudentsData?.newStudents.studentsArray || []
  const studentInfo = studentsInfoData?.student.studentInfo || 0;

  const _navigateToProfile = (targetId: string) => {
    if (targetId === currentUserId) {
      navigation.navigate('MyProfile', { screen: '_myProfileRoot' })
      return;
    }
    navigation.navigate('Classlist',
      {
        screen: '_fullProfile',
        params: {
          targetId
        }
      }
    );
  }

  async function onShare() {
    try {
      const result = await Share.share({
        message:
          'Check out the new Classmates™ Mobile App!',
        url:
          'https://www.classmates.com/mobile-app',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log(error + 'Error during the onShare process');
    }
  }

  const slicedStudents = studentsArray
    .filter(student => !(student.isBlocked))
    .slice(0, 3)
  const unblockedStudentCount = slicedStudents.length

  return (
    <BaseModule
      icon={<Icon.Button name='graduation-cap'
        size={28}
        color={'black'}
        backgroundColor={'transparent'}
        iconStyle={{ marginTop: -7, marginRight: 0 }}
      />}
      heading="New People"
    >
      <Card>
        <Card.Title
          style={{ textAlign: 'left', marginBottom: 0 }}
          accessible={true}
          accessibilityLabel='People in this class'
          accessibilityRole='text'
        >
          {getClassCountString(studentInfo)} in this class
        </Card.Title>

        {(unblockedStudentCount === 0) &&
          <View style={{ backgroundColor: Colors.whiteLevel(3), alignItems: 'center', marginTop: 10, borderRadius: 40, padding: 20 }}>
            <Text>Sorry, no one has joined lately.</Text>
            <Text
              accessibilityLabel='Invite a schoolmate to join'
              accessible={true}
              accessibilityRole='link'
              onPress={onShare}
              style={[globalStyles.linkColor, globalStyles.boldText]}
            >Invite a schoolmate to join &gt;&gt;
            </Text>
          </View>
        }

        {(unblockedStudentCount > 0) && slicedStudents.map((student, i) => {
          return (
            <View key={i}>
              <UserListItem
                student={student}
                affiliation={currentAffiliation}
                accessibilityLabel='New person profile'
                onPress={() => _navigateToProfile(student.personId)}
              />
            </View>
          );
        })
        }

        <Button
          title={`VIEW ${getClassTitle(endYear, isStudent, startYear).toUpperCase()}`}
          style={{ paddingVertical: 12, marginTop: 15 }}
          accessibilityLabel='View Class'
          accessible={true}
          onPress={() => navigation.dispatch(DrawerActions.jumpTo('Classlist'))}
        />
      </Card>
    </BaseModule>
  );
};
