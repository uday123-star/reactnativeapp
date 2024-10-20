import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableWithoutFeedbackProps, ViewStyle } from 'react-native';
import { ListItem } from 'react-native-elements';
import { BlurredName } from '../BlurredName';
import { format, parse } from 'date-fns';
import { useAppSelector } from '../../../redux/hooks';
import { ProfileVisitState } from '../../../redux/slices/profile-visits/slice';
import { VisitReceived } from '../../../data/queries/profile-visits/fetch';
import { LoadingListItem } from './list-item-loading';
import { UserAvatarBlurred } from '../UserAvatarBlurred';

interface Props {
  containerStyle?: StyleProp<ViewStyle>
  forceLoadingState?: boolean
  isGold: boolean
  student?: VisitReceived
  blurredImageRef: number
  onPress?: TouchableWithoutFeedbackProps['onPress']
}

export const UserGBListItem = ({ student, forceLoadingState = false, containerStyle, isGold = false, onPress }: Props): JSX.Element => {

  let formattedDate = '';
  const profileVisitState = useAppSelector(state => state.profileVisits.profileVisitState);
  const { isLoading, isReloading } = ProfileVisitState;
  const shouldShowLoader = forceLoadingState || [isLoading, isReloading].includes(profileVisitState);

  if (shouldShowLoader) {
    return <LoadingListItem />
  }

  if (student?.visitDate) {
    const date = parse(student.visitDate, 'yyyy-MM-dd', new Date());
    formattedDate = format(date, 'd MMMM, yyyy');
  }

  const shouldShowAvatar = !shouldShowLoader && student;
  const schoolName = student?.visitorAffiliation?.schoolName;
  const shouldShowSchoolName = !shouldShowLoader && schoolName;
  const shouldShowDate = !shouldShowLoader && formattedDate;
  // To make the component idempotent,
  // use the last character from the visitor id.
  const blurredImageRef = (!shouldShowLoader && student && +student?.visitorId.slice(-1)) || 0;
  containerStyle = shouldShowLoader ? {} : containerStyle;

  return (
    <ListItem
      Component={TouchableOpacity}
      containerStyle={[containerStyle, { height: 100 }]}
      disabledStyle={{ opacity: 0.5 }}
      onPress={onPress}
      pad={20}
    >

      {shouldShowAvatar && <UserAvatarBlurred photoUrl={student?.nowPhoto?.display?.url || student?.thenPhoto?.display?.url || ''}
        personId={student.visitorId}
        useBlur={!isGold}
      />}

      <ListItem.Content>
        {isGold
          ?
            <ListItem.Title>
              <Text style={{ fontWeight: 'bold' }}>{student?.visitorFirstName} {student?.visitorLastName}</Text>
            </ListItem.Title>
          :
            <ListItem.Title style={{ height: 35, position: 'relative', top: 2, left: -6 }}>
              <BlurredName blurredImageRef={blurredImageRef % 10} />
            </ListItem.Title>
        }
        <ListItem.Subtitle>
          {shouldShowSchoolName && <Text>{schoolName}</Text>}
        </ListItem.Subtitle>
        <ListItem.Subtitle>
          {shouldShowDate && <Text>{formattedDate}</Text>}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  )
}

