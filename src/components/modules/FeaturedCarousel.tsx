import React, { useEffect } from 'react'
import { useCurrentAffiliation, useCurrentUserId } from '../../../redux/hooks'
import { BaseModule } from './Base'
import Icon from 'react-native-vector-icons/FontAwesome'
import { FeaturedCarousel } from '../carousels/featured'
import { AffiliationModel, PersonModel, StudentModel } from '../../../types/interfaces'
import { CarouselState } from '../../../redux/slices/feature-carousel/slice'
import { NetworkStatus, useQuery } from '@apollo/client'
import { FeatureCarouselResponse, LOAD_CAROUSEL } from '../../../data/queries/people/feature-carousel'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../../types/types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { getSessionData } from '../../helpers/session'
import { useAffiliationYearRange } from '../../hooks'

interface FeaturedItemProps {
  person?: PersonModel
  student?: StudentModel
  currentAffiliation: AffiliationModel
}

export const FeaturedCarouselModule = () => {
  const currentUserId = useCurrentUserId();
  const navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> = useNavigation()
  const currentAffiliation = useCurrentAffiliation()
  const focused = useIsFocused();
  const { range, end: endYear, isStudent } = useAffiliationYearRange();

  const { schoolId } = currentAffiliation;
  const variables = {
    year: isStudent ? endYear : range,
    schoolId: String(schoolId),
  };

  const { data, loading, error, networkStatus, startPolling, stopPolling } = useQuery<FeatureCarouselResponse>(LOAD_CAROUSEL, {
    variables: variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    onError: (error) => {
      const session = getSessionData();
      DdRum.addError('Loading Featured Members Module', ErrorSource.SOURCE, error.message || 'Error fetching featured carousel', {
        variables,
        session
      }, Date.now())
    }
  });

  useEffect(() => {
    return () => {
      stopPolling();
    }
  }, []);

  useEffect(() => {
    if (focused) {
      startPolling(120000);
    } else {
      stopPolling();
    }
  }, [focused]);

  const items = data?.carousel.items || [];
  const students = items.filter(student => !(student.isBlocked));

  const navigateToCarousel = ({ person, student, currentAffiliation }: FeaturedItemProps) => {
    if (!person && !student) {
      return;
    }

    let targetId = '';

    if (person && person.id) {
      targetId = person.id;
    }

    if (!targetId && student && student.personId) {
      targetId = student?.personId;
    }

    if (targetId === currentUserId) {
      navigation.navigate('MyProfile', {
        screen: '_myProfileRoot'
      });
      return;
    }

    navigation.navigate('Classlist',
      {
        screen: '_carousel',
        params: {
          studentId: targetId,
          schoolId: currentAffiliation.schoolId,
          students
        }
      });
  }

  const {
    IsLoading,
    HasOneResult,
    HasManyResults,
    HasNoResults,
    HasError
  } = CarouselState;

  const carouselState = (loading || networkStatus === NetworkStatus.loading) ? IsLoading : 
    error ? HasError :
    students.length === 0 ? HasNoResults :
    students.length === 1 ? HasOneResult : HasManyResults;

  return (
    <BaseModule
      heading={`Featured Member${students.length === 1 ? '' : 's'}`}
      icon={
        <Icon.Button name="user"
          size={28}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -7, marginRight: 0 }}
        />
      }
    >
      <FeaturedCarousel
        currentAffiliation={currentAffiliation}
        navigateToCarousel={navigateToCarousel}
        items={students}
        carouselState={carouselState}
      />
    </BaseModule>
  )
}
