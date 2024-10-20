import { useLazyQuery, useMutation } from '@apollo/client';
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native';
import { useRoute } from '@react-navigation/native';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { PlaceholderLine } from 'rn-placeholder';
import { AddVisitResponse, GET_VISIT } from '../../../data/queries/visits/add';
import { UpdatedVisitsResponse, UpdateVisitArgs, UPDATE_VISIT } from '../../../data/queries/visits/update';
import { useIsSignedIn } from '../../../redux/hooks';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/global-stylesheet';
import { StudentModel, VisitOrigin, VisitsResponse, VisitTypeEnum } from '../../../types/interfaces';
import { getVisitButtonState, getTimeAgo, VisitButtonState } from '../../helpers/visits';
import { useLogVisit } from '../../hooks/useLogVisit';
import { useVisiteeIdByOrigin } from '../../hooks/useVisiteeIdByOrigin';
import { useVisitOrigin } from '../../hooks/useVisitOrigin';
import { Text } from '../Text'

interface Props {
  student: StudentModel
  visitOrigin: VisitOrigin
  onRemove(): void
  onVisitData(visit: VisitsResponse): void
}

const { CUSTOM, TAP } = RumActionType;

const { Loading, CanAddVisit, CanRemoveVisit, Permanent, Error } = VisitButtonState;

export const VisitBarButton = ({ student, visitOrigin: origin, onRemove, onVisitData }: Props): JSX.Element => {
  const route = useRoute();
  const visitOrigin = useVisitOrigin(origin);
  const isVisiteeSignedIn = useIsSignedIn(student.personId);
  const currentVisiteeId = useVisiteeIdByOrigin(`${route.name}:${origin}`);
  const [isFocused, setIsFocused] = useState(false);
  const [componentState, setComponentState] = useState<VisitButtonState>(Loading)
  const logVisit = useLogVisit();

  const [addVisit, addVisitResult] = useLazyQuery<AddVisitResponse>(GET_VISIT, {
    variables: {
      visiteeId: student.personId,
      visitOrigin
    }
  })
  const [updateVisit] = useMutation<UpdatedVisitsResponse>(UPDATE_VISIT);

  useEffect(() => {
    setIsFocused(currentVisiteeId === student.personId)
  }, [currentVisiteeId]);

  useEffect(() => {
    // auto-add visit if component renders
    // and visitee is not the current user (can't visit yourself)
    if (isFocused && !isVisiteeSignedIn) {
      addVisit({
        onError(error) {
          DdRum.addError(
            'error while adding a visit',
            ErrorSource.CUSTOM,
            error.stack || __filename,
            {
              message: error.message
            }
          )
        },
        onCompleted(data) {
          logVisit(data.visitByVisiteeId);
          DdRum.addAction(CUSTOM, 'add visit', {
            currentVisiteeId: data.visitByVisiteeId.visiteeId
          }, Date.now())
        }
      })
    }
  }, [isFocused, isVisiteeSignedIn])

  // sets initial component state
  // getVisit is fired whenever the component is initially rendered
  React.useEffect(() => {
    if (!addVisitResult || !addVisitResult.called) return;

    if (addVisitResult.data?.visitByVisiteeId) {
      onVisitData(addVisitResult.data?.visitByVisiteeId)
    }
    // set component state, based on initial data response
    setComponentState(getVisitButtonState(addVisitResult.data?.visitByVisiteeId, addVisitResult.error, addVisitResult.loading))
  }, [addVisitResult.data, addVisitResult.loading, addVisitResult.error])

  const doUpdate = async (addVisit: VisitsResponse) => {
    const { id: visitId } = addVisit;
    const visiteeId = student.personId;

    const updateVisitVariables: UpdateVisitArgs = {
      visitId,
      visiteeId,
      visitType: VisitTypeEnum.normal
    }
    updateVisit({
      variables: updateVisitVariables,
      onCompleted({ updateVisit }) {
        setComponentState(getVisitButtonState(updateVisit))

        DdRum.addAction(CUSTOM, 'updated a visit', {
          updateVisit
        }, Date.now())
      },
      onError(error) {
        DdRum.addError(
          error.message || 'an error occured while updating a visit',
          ErrorSource.CUSTOM,
          error.stack || 'no stack available',
          {
            visiteeId,
            visitOrigin,
            visitId
          }
        )
        setComponentState(Error)
      },
      update(cache, { data: newData }) {
        if (!addVisit) return;

        cache.modify({
          id: cache.identify({
            ...addVisit
          }),
          fields: {
            visitType() {
              return newData?.updateVisit.visitType;
            }
          }
        })

        setComponentState(getVisitButtonState(newData?.updateVisit))
      }
    });
  }

  const doClick = async () => {
    const addVisit = addVisitResult.data?.visitByVisiteeId;
    let actionDescription = ''

    if (!addVisit) {

      DdRum.addError('tried to mutate an undefined visit',
        ErrorSource.CUSTOM,
        __filename,
        {
          addVisit
        }
      )
      return;
    }

    // switch state
    if (componentState === CanAddVisit) {
      setComponentState(Loading);
      const visit = addVisitResult.data?.visitByVisiteeId;
      actionDescription = 'updating visit'
      if (visit?.visitType === VisitTypeEnum.anonymous) {
        await doUpdate(addVisit)
      }
      if (visit?.visitType === VisitTypeEnum.deleted) {
        await addVisitResult.refetch().then(async (reponse) => {
          await doUpdate(reponse.data.visitByVisiteeId);
        })
      }
    }

    if (componentState === CanRemoveVisit) {
      onRemove()
      actionDescription = 'removing visit'
    }

    // lastly, report the event to datadog
    DdRum.addAction(TAP, actionDescription, {
      currentVisiteeId: currentVisiteeId
    }, Date.now());
  }

  // begin handling various Button states
  if (componentState === Loading) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <PlaceholderLine width={60} />
      </View>
    )
  }

  if ([CanAddVisit, Error].includes(componentState)) {
    return (
      <TouchableOpacity
        onPress={doClick}
        accessible={true}
        accessibilityLabel='Tell this student you visited'
        accessibilityRole='link'
      >
        <Text
          accessible={false}
          style={globalStyles.linkRightAction}
          numberOfLines={1}
        >
          {Boolean(Boolean(Error) && Boolean(addVisitResult.error?.message)) &&
            <Text style={{ color: 'red' }}>!</Text>
          }
          TELL {student.firstName?.toUpperCase()}</Text>
        <Text
          accessible={false}
          style={globalStyles.linkRightAction}
        >YOU VISITED</Text>
      </TouchableOpacity>
    )
  }

  if (componentState === CanRemoveVisit) {
    return (
      <TouchableOpacity
        accessibilityLabel='Remove Visit'
        accessible={true}
        accessibilityRole='link'
        onPress={doClick}
      >
        <Text style={globalStyles.linkRightAction}>REMOVE VISIT</Text>
      </TouchableOpacity>
    )
  }

  if (componentState === Permanent) {
    return (
      <Text style={{
        ...globalStyles.linkRightAction,
        textTransform: 'uppercase'
      }}
      >
        {/* // visitData is guarantee here */}
        {getTimeAgo({ visitData: addVisitResult.data?.visitByVisiteeId })}
      </Text>
    )
  }

  DdRum.addError(
    'unknown visit state fallthrough',
    ErrorSource.CUSTOM,
    'VisitBarButton.tsx',
    {
      visiteeid: student.id,
      visitOrigin
    }
  )

  return (
    <View>
      <Text style={{ color: Colors.red }}>Oops. An error occurred.</Text>
    </View>
  )
}
