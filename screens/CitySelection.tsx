import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View, Text, StyleSheet, Button } from 'react-native'
import { globalStyles } from '../styles/global-stylesheet'
import { MyProfileStackParamList } from '../types/types'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { City, FetchAllCitiesResponse, FETCH_ALL_CITIES } from '../data/queries/location/fetch-cities'
import { useMutation, useQuery } from '@apollo/client'
import find from 'lodash/find'
import { useFocusedStatus } from '../src/hooks'
import { dataDogStartAction } from '../src/helpers/datadog'
import { RumActionType } from '@datadog/mobile-react-native'
import { UpdateLocationArgs, UpdateLocationResponse, UPDATE_USER_LOCATION } from '../data/queries/my-profile/update-location'
import { useCurrentUserId } from '../redux/hooks'

type Props = NativeStackScreenProps<MyProfileStackParamList, '_citySelection'>

export const CitySelectionScreen = ({ navigation, route }: Props) => {
  useFocusedStatus(navigation, route, false);
  const params = route.params;
  const { currentState, currentCity } = params;
  const currentUserId = useCurrentUserId();
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ selectedCityIndex, setSelectedCityIndex ] = useState(-1)
  const [ selectedCity, setSelectedCity ] = useState<City|null>(null)

  const { data: cityData, loading, error } = useQuery<FetchAllCitiesResponse>(FETCH_ALL_CITIES, {
    variables: {
      state: currentState.id
    }
  });

  const [ updateLocation, { client } ] = useMutation<UpdateLocationResponse>(UPDATE_USER_LOCATION);
  const _updateLocation = (location: UpdateLocationArgs) => {
    const cachedId = client.cache.identify({
      __typename: 'Person',
      id: currentUserId
    });
    client.cache.modify({
      id: cachedId,
      fields: {
        currentCity: () => 'UPDATING',
        currentState: () => 'UPDATING',
      }
    });
    updateLocation({
      variables: location,
      update: (cache, { data }) => {
        cache.modify({
          id: cachedId,
          fields: {
            currentCity: () => data?.updatePerson.currentCity,
            currentState: () => data?.updatePerson.currentState
          }
        })
      }
    });
  }

  useEffect(() => {

    if (!cityData?.cities.length) {
      return;
    }

    if (selectedCityIndex === -1) {
      const city = find(cityData.cities, { name: currentCity }) || null;
      if (city) {
        return setSelectedCity(city);
      }
      return setSelectedCityIndex(0);
    }

    if (selectedCityIndex === 0) {
      return setSelectedCity(cityData.cities[0])
    }

    // has cities w/ selected index greater than 1
    setSelectedCity(cityData?.cities[selectedCityIndex])
  }, [cityData?.cities, selectedCityIndex])

  const _submitCityAndState = () => {
    dataDogStartAction(RumActionType.TAP, 'submit location button')
    if (cityData?.cities.length && currentState.abbreviation) {
      const [city, state] = [selectedCity?.name, currentState.abbreviation];
      setIsSubmitting(true);

      if (city && state) {
        _updateLocation({ currentCity: city, currentState: state });
        navigation.goBack();
      } else {
        throw new Error('error setting user location, city or state is falsy');
      }

    } else {
      console.error('cannot submit city and state without cityData');
    }
  }

  if (loading || isSubmitting) {
    return (
      <ScreenLoadingIndicator />
    )
  }

  if (cityData?.cities.length) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.headerText}>Find a City In {currentState.name}</Text>
        <Picker
          // if the loaded cities belong to the users' currentState
          // we use the current city as the default selectedValue.
          selectedValue={(selectedCityIndex === -1) ? currentCity : selectedCity?.name}
          onValueChange={(value, index) => {
            setSelectedCityIndex(index)
          }}
        >
          {cityData?.cities.map((city, i) => {
            return (<Picker.Item value={city.name}
              label={city.name}
              key={i}
            />)
          })}
        </Picker>
        <Button title='submit'
          accessibilityLabel='submit'
          onPress={() => _submitCityAndState()}
        />
      </View>
    )
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text>Failed getting list of cities</Text>
      </View>
    )
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center'
  }
})
