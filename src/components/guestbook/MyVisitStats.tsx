import { useQuery } from '@apollo/client';
import React from 'react'
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PlaceholderLine } from 'rn-placeholder';
import { PeopleResponse, VisitsCount } from '../../../data/queries/people/person-data';
import { GET_VISITS_DATA } from '../../../data/queries/visits/fetch';
import { useCurrentUser } from '../../../redux/hooks';
import { globalStyles } from '../../../styles/global-stylesheet'
import { Text } from '../Text'

export const MyVisitStats = () => {

  const currentUser = useCurrentUser();

  const { data: visitsData, loading: loadingVisitsData, error: errorVisitsData } = useQuery<PeopleResponse>(GET_VISITS_DATA, {
    variables: {
      personId: currentUser.personId
    },
    fetchPolicy: 'no-cache',
  });

  const emptyVisitsCount: VisitsCount = {
    namedCount: 0,
    totalCount: 0,
    newCount: 0,
  };
  const [visitsCount, setVisitsCount] = useState<VisitsCount>(emptyVisitsCount);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loadingVisitsData) {
      setIsLoading(true)
    }
    if (!loadingVisitsData && !errorVisitsData && visitsData) {
      setVisitsCount(visitsData?.people[0]?.visits || emptyVisitsCount)
      setIsLoading(false);
    }
  }, [visitsData, loadingVisitsData, errorVisitsData])

  if (isLoading) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <PlaceholderLine width={60} />
      </View>
    )
  }

  return (
    <Text
      style={globalStyles.linkRightAction}
      accessible={true}
      accessibilityRole='text'
      accessibilityLabel='Profile New Visits'
    >
      {visitsCount.newCount} NEW
    </Text>
  )
}
