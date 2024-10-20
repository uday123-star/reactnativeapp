import React, { useEffect, useReducer, useState } from 'react';
import { StyleSheet, SafeAreaView, View, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { useCurrentAffiliation, useCurrentUserId } from '../redux/hooks';
import UserListItem from '../src/components/UserListItem';
import { ClasslistHeader } from '../src/components/ClasslistHeader';
import { AffiliationModel, StudentModel } from '../types/interfaces';
import { NoSearchResultsListItem } from '../src/components/NoSearchResultsListItem';
import { SearchErrorListItem } from '../src/components/SearchErrorListItem';
import { AffiliationDropdown } from '../src/components/AffiliationDropdown';
import { ClasslistStackParamList } from '../types/types';
import { NetworkStatus, useLazyQuery, useQuery } from '@apollo/client';
import { GET_STUDENTS, StudentsInfoResponse, StudentsResponse, STUDENTS_INFO } from '../data/queries/students/students';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAffiliationYearRange, useOnBlockUser } from '../src/hooks';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { Colors } from '../styles/colors';
// import { NoMoreResultsListItem } from '../src/components/NoMoreResultsListItem';
import { SearchStudentsResponse, SEARCH_STUDENTS } from '../data/queries/students/student-search';
import { emptyStudent } from '../redux/slices/current-affiliation/helpers';
import { useMatchSorter } from '../src/hooks/conversations/useMatchSorter';
import { VisiteesByOrigin } from '../src/hooks/useVisiteeIdByOrigin';

type Props = NativeStackScreenProps<ClasslistStackParamList, '_classlist'>

export const ClasslistScreen = ({ navigation, route }: Props): JSX.Element => {
  const currentUserId = useCurrentUserId();
  const blockState = useOnBlockUser();
  // Always get current affiliation data at the start,
  // everything hinges off of this data
  const currentAffiliation = useCurrentAffiliation();
  const { range: yearRange, end: endYear, isStudent } = useAffiliationYearRange();
  const gradYear = endYear;
  const schoolId = String(currentAffiliation.schoolId);

  const [hasMoreData, setHasData] = useReducer((state: boolean, value: boolean) => value, true);

  const defaultVariables = {
    schoolId,
    year: isStudent ? gradYear : yearRange,
    limit: 100,
    offset: 0
  };

  const [ variables, setVariables ] = useState(defaultVariables);

  // search query is always empty at screen init
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false);

  // get student info, so we have a count of all students
  // in the class, regardless of pagination limits
  const { data: studentsInfoData } = useQuery<StudentsInfoResponse>(STUDENTS_INFO, {
    variables: {
      schoolId: String(defaultVariables.schoolId),
      year: defaultVariables.year,
      affiliationAge: 'ALL'
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    onError(error) {
      DdRum.addError(
        error.message || 'an error occurred while fetching studentInfo',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          queryVariables: {
            schoolId: String(currentAffiliation.schoolId),
            year: endYear,
            affiliationAge: 'ALL'
          },
          error: {
            error
          }
        }
      )
    }
  });

  const [ searchStudents, { data: searchData, loading: searchLoading, error: searchError }] = useLazyQuery<SearchStudentsResponse>(SEARCH_STUDENTS, {
    fetchPolicy: 'cache-and-network',
    onError(error) {
      DdRum.addError(
        error.message || 'an error was thrown while searching students',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          searchVariables: variables,
          error
        },
        Date.now()
      )
    },
  });

  const {
    data: unfilteredStudents,
    previousData,
    loading: studentsLoading,
    error: studentsError,
    fetchMore: paginateStudents,
    refetch: refetchStudents,
    networkStatus
  } = useQuery<StudentsResponse>(GET_STUDENTS, {
    variables: defaultVariables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onError(error) {
      DdRum.addError(
        error.message || 'error was thrown while fetching classlist',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          queryVariables: variables,
          error: {
            error
          }
        },
        Date.now()
      )
    }
  })

  const _doSearch = (query = '') => {

    const trimmedQuery = query.trim()

    const isValid = Boolean(trimmedQuery.length);
    setIsSearching(isValid);
    if (isValid) {
      const firstChar = trimmedQuery.charAt(0);
      if (searchQuery.charAt(0) === firstChar) {
        setSearchQuery(trimmedQuery);
      } else {
        setSearchQuery(firstChar);
        searchStudents({
          variables: {
            schoolId: defaultVariables.schoolId,
            year: defaultVariables.year,
            text: firstChar
          }
        });
      }
    } else {
      _doRefresh();
    }
  }

  const _doRefresh = () => {
    setIsSearching(false)
    setVariables(defaultVariables);
    setSearchQuery('');
    setHasData(true);
    refetchStudents(defaultVariables);
  }

  useEffect(() => {
    if (blockState && blockState.action === 'unblock') {
      _doRefresh();
    }
  }, [blockState]);

  const _loadNextPageOfStudents = () => {
    if (networkStatus === NetworkStatus.fetchMore || !hasMoreData) return;
    const paginationVars = {
      ...variables,
      offset: variables.offset + 100,
    };
    setVariables(paginationVars);
    paginateStudents({
      variables: paginationVars,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.student.studentsArray.length === 0) return prev;
        return {
          ...prev,
          student: {
            ...prev.student,
            studentsArray: [
              ...prev.student.studentsArray,
              ...fetchMoreResult.student.studentsArray
            ]
          }
        }
      }
    }).catch((reason) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = reason.graphQLErrors.find((error: any) => error.extensions.userMessage === 'error offset not in range' && error.extensions.errorCode === '400');
        if (error) {
          setHasData(false);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  // the individual list item to show in the flatlist
  const _renderItem = ({ item: student, index: slideIndex }: { item: StudentModel; index: number }) => {
    return (
      <UserListItem
        isInFlashList={true}
        student={student}
        affiliation={currentAffiliation}
        accessibilityLabel='Profile links'
        onPress={() => _clickItem({ currentAffiliation, student, slideIndex })}
        key={`${student.id}-${student.personId}-${new Date().getTime()}`}
      />
    )
  }

  // when clicking directly into a listItem,
  // we must set a reference to that item
  // on the profile-carousel state to ensure visits
  // continues to work properly ( onlayout ).
  const _clickItem = ({ currentAffiliation, student }: { currentAffiliation: AffiliationModel; student: StudentModel; slideIndex: number }): void => {
    if (currentUserId === student.personId) {
      navigation.navigate('_myProfile');
      return;
    }
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:profile:people`]: student.personId || student.id
    })
    const students = (isSearching ? filteredResult : (unfilteredStudents || previousData)?.student.studentsArray) || [];
    navigation.push('_carousel', { schoolId: currentAffiliation.schoolId, studentId: student.id, students });
  }

  const _filterStudents = (students: StudentModel[]) => students.filter(student => !(student.isBlocked));

  const filteredResult = useMatchSorter(searchData?.searchStudents || [], searchQuery);

  const data = _filterStudents(isSearching ? filteredResult : ((unfilteredStudents || previousData)?.student.studentsArray || []));

  return (
    <SafeAreaView style={styles.container}>
      <AffiliationDropdown
        showSchoolName={true}
        showSchoolLocation={true}
      />
      <ClasslistHeader
        studentCount={studentsInfoData?.student.studentInfo || 0}
        doSearch={_doSearch}
        reset={_doRefresh}
      />
      <FlatList
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={(searchLoading || studentsLoading) ? null : (<NoSearchResultsListItem />)}
        ListFooterComponent={() => (
          <View>
            {Boolean(networkStatus === NetworkStatus.fetchMore) &&
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center'
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
            }
            {
              Boolean((searchLoading || studentsLoading) && !(networkStatus === NetworkStatus.fetchMore)) && <UserListItem
                isInFlashList={true}
                student={emptyStudent()}
                isLoading={true}
                affiliation={currentAffiliation}
                accessibilityLabel='Profile links'
              />
            }
            {/* {
              Boolean(!hasMoreData) && <NoMoreResultsListItem />
            } */}
            {
              Boolean(studentsError || searchError) && <SearchErrorListItem />
            }
          </View>
        )}

        // if there's a query, search, and use searchResults as datasource
        // otherwise, use the classlist as the datasource
        data={data}
        renderItem={_renderItem}
        onEndReached={isSearching ? null : _loadNextPageOfStudents}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={(networkStatus === NetworkStatus.refetch && !isSearching)} onRefresh={_doRefresh} />}
        keyExtractor={(item, index) => {
          return `${item.id}-${item.personId}-${index}`;
        }}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 0,
  },
  loadingText: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    marginHorizontal: 15
  }
});
