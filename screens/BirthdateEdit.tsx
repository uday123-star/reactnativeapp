import * as React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, View, Button, Text, ActivityIndicator } from 'react-native'
import { MyProfileStackParamList } from '../types/types'
import DatePicker from 'react-native-date-picker'
import { format, intervalToDuration } from 'date-fns'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { globalStyles } from '../styles/global-stylesheet'
import { addYears } from 'date-fns/esm'
import { parseIsoString } from '../src/helpers/dates'
import { Colors } from '../styles/colors'
import { useFocusedStatus } from '../src/hooks'
import { dataDogStartAction } from '../src/helpers/datadog'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { useMutation } from '@apollo/client'
import { UpdateBirthdayResponse, UPDATE_MY_BIRTHDAY } from '../data/queries/my-profile/update-birthday'
import { useCurrentUserId } from '../redux/hooks'
import { getSessionData } from '../src/helpers/session'
import { BirthDateConfidenceLevel } from '../types/interfaces'

type Props = NativeStackScreenProps<MyProfileStackParamList, '_editBirthday'>

export const BirthdateEditScreen = ({ navigation, route }: Props) => {
  useFocusedStatus(navigation, route, false);
  const currentuserId = useCurrentUserId();

  const { birthDate } = route.params;
  let initialDate = addYears(new Date(), -50);

  if (birthDate) { // expected to be formatted: "1997-01-31"
    initialDate = new Date(parseIsoString(birthDate));
  }

  const [date, setDate ] = useState(initialDate)
  const [isButtonDisabled, setIsButtonDisabled ] = useState(false)
  const [hasError, setHasError] = useState(false);

  const [ updateBirthdate, {
    client
  }] = useMutation<UpdateBirthdayResponse>(UPDATE_MY_BIRTHDAY, {
    fetchPolicy: 'network-only'
  });

  const _updateBirthdate = (date: string) => {
    const cachedId = client.cache.identify({
      __typename: 'Person',
      id: currentuserId
    });
    client.cache.modify({
      id: cachedId,
      fields: {
        birthDateConfidenceLevel: () => BirthDateConfidenceLevel.UPDATING,
      }
    });
    const variables = {
      birthDate: date
    };
    updateBirthdate({
      variables,
      update: (cache, { data }) => {
        cache.modify({
          id: cachedId,
          fields: {
            birthDate: () => data?.updatePerson.birthDate,
            birthDateConfidenceLevel: () => data?.updatePerson.birthDateConfidenceLevel,
          }
        });
      },
      onError: (error) => {
        const sessionData = getSessionData();
        DdRum.addError('Update Birthdate', ErrorSource.CUSTOM, error.message || 'Error updating birthdate', {
          session: sessionData,
          variables
        }, Date.now());
      }
    });
  }

  // whenever the birthdate is changed, we
  // validate that it a minimum of 18 years
  // and trigger error condition if necessary
  useEffect(() => {
    const { years = 0 } = intervalToDuration({
      start: date,
      end: (new Date())
    })

    setHasError(years < 18)
    setIsButtonDisabled(years < 18)
  }, [date])

  const formatBirthDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd')
  }

  const _submit = () => {
    dataDogStartAction(RumActionType.TAP, 'submit birthday button')
    const newDate = formatBirthDate(date);
    setIsButtonDisabled(true);
    _updateBirthdate(newDate);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {
        Boolean(hasError) && <Text style={[globalStyles.errorText, { fontSize: 18 }]}>The selected date is too low.</Text>
      }
      <DatePicker
        date={date}
        mode={'date'}
        onDateChange={setDate}
      />
      {
        !isButtonDisabled && <Button 
          title="Submit"
          accessibilityLabel='submit'
          onPress={_submit}
        />
      }
      {
        Boolean(isButtonDisabled) && <ActivityIndicator
          color={Colors.cyan}
          style={{
            width: 40,
            height: 40
          }}
        />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
