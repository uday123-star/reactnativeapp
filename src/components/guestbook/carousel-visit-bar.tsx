import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StudentModel, VisitOrigin, VisitsResponse, VisitTypeEnum } from '../../../types/interfaces';
import {
  Placeholder,
  PlaceholderLine,
  Fade
} from 'rn-placeholder';
import { RemoveVisitModal } from './remove-visit-modal';
import { useQuery } from '@apollo/client';
import { PeopleResponse, VisitsCount } from '../../../data/queries/people/person-data';
import { GET_VISITS_DATA } from '../../../data/queries/visits/fetch';
import BasicAlert from '../BasicAlert';
import { VisitBarButton } from './VisitBarButton';
import { MyVisitStats } from './MyVisitStats';
import { useIsSignedIn } from '../../../redux/hooks';
import { useVisiteeIdByOrigin } from '../../hooks/useVisiteeIdByOrigin';
import { useRoute } from '@react-navigation/native';

interface Props {
  visitOrigin: VisitOrigin
  autoHeight?: boolean
  student: StudentModel
}

/**
 * The UI gives ALL users, the option to leave a normal visit.
 *   * Users that are in quiet mode, leave anonymous visits on every item,
 *      after an hour that anonymous visit is discarded. Users with anonymous
 *      visits have the option to leave ( change the temp visit to ) a permanent visit.
 *   * Users that are NOT in quiet mode leave normal visits on every
 *      item viewed.
 *   * All normal visits are removable for approx 1 hour after creation.
 *   * Once a ( normal ) visit becomes permanent, it cannot be removed.
 */
const GuestbookVisitBar = ({ visitOrigin, student, autoHeight = false }: Props): JSX.Element => {
  const route = useRoute();
  const currentVisiteeId = useVisiteeIdByOrigin(`${route.name}:${visitOrigin}`);
  const isVisiteeSignedIn = useIsSignedIn(currentVisiteeId || '');
  const [isFocused, setIsFocused] = useState(false);
  const [visitData, setVisitData] = useState<VisitsResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);

  const emptyVisitsCount: VisitsCount = {
    namedCount: 0,
    totalCount: 0,
    newCount: 0,
  };
  const [visitsCount, setVisitsCount] = useState<VisitsCount>(emptyVisitsCount);

  useEffect(() => {
    setIsFocused(currentVisiteeId === student.personId)
  }, [currentVisiteeId]);

  const { data: visitsData, loading: loadingVisitsData, error: errorVisitsData, refetch: refetchVisitsData } = useQuery<PeopleResponse>(GET_VISITS_DATA, {
    variables: {
      personId: student.personId
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (loadingVisitsData) {
      setIsLoading(true)
    }
    if (!loadingVisitsData && !errorVisitsData && visitsData) {
      setVisitsCount(visitsData?.people[0]?.visits || emptyVisitsCount)
      setIsLoading(false);
    }
  }, [visitsData, loadingVisitsData, errorVisitsData])

  const {
    normal,
    permanent,
    deleted
  } = VisitTypeEnum;

  if (isLoading || !isFocused) {
    return (
      <Placeholder Animation={Fade}>
        <View style={{ flex: 1, flexDirection: 'row', height: autoHeight ? 'auto' : 50, minHeight: 40, marginTop: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <PlaceholderLine width={60} />
          </View>
          <PlaceholderLine width={25} />
        </View>
      </Placeholder>
    )
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', height: autoHeight ? 'auto' : 50, marginTop: 10 }}>
      <View style={{ flex: 1, flexDirection: 'row', marginLeft: -5 }}>
        <Icon.Button name="user"
          size={28}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -8, marginRight: -3 }}
        />

        <Text
          style={{ fontSize: 12 }}
          accessible={true}
          accessibilityRole='text'
          accessibilityLabel='Number of people who visited'
        >
          {
            ((visitData?.visitType === normal || visitData?.visitType === permanent))
              ? <Text>YOU LEFT A VISIT ON {'\n'}THIS PROFILE</Text>
              : <Text>{visitsCount.namedCount || 0} PEOPLE VISITED {'\n'}THIS PROFILE</Text>
          }
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {isVisiteeSignedIn ?
          <MyVisitStats />
          :
          <VisitBarButton
            student={student}
            visitOrigin={visitOrigin}
            onRemove={() => setIsRemoveModalVisible(true)}
            onVisitData={setVisitData}
          />
      }

      </View>
      <RemoveVisitModal
        visitId={visitData?.id || ''}
        isVisible={isRemoveModalVisible}
        onClose={(visit) => {
          setIsRemoveModalVisible(false);
          if (visit) {
            setVisitData({
              ...(visitData || {}),
              visitType: deleted
            } as VisitsResponse);
            refetchVisitsData();
          }
        }}
        onModalHide={(hasError, visit) => {
          if (hasError) {
            BasicAlert.show({
              title: 'Profile Visits',
              text: visit ? 'Sorry, too much time has passed and you can no longer delete this visit' :
                'Oops! There was an error trying to delete your visit, try again later',
            });
          }
          if (visit) {
            setVisitData({
              ...(visitData || {}),
              visitType: permanent
            } as VisitsResponse);
          }
        }}
        visiteeId={student.personId}
      />
    </View>
  )
}

export default GuestbookVisitBar;
