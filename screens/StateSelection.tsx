import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MyProfileStackParamList } from '../types/types'
import { globalStyles } from '../styles/global-stylesheet'
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator'
import { useQuery } from '@apollo/client'
import { FetchAllStatesResponse, FETCH_ALL_STATES, State } from '../data/queries/location/fetch-states'
import find from 'lodash/find'
import { useFocusedStatus } from '../src/hooks'

type Props = NativeStackScreenProps<MyProfileStackParamList, '_stateSelection'>

export const StateSelectionScreen = ({ navigation, route }: Props) => {
  useFocusedStatus(navigation, route, false);
  const params = route.params;
  const { currentState, currentCity } = params;
  const [ selectedIndex, setSelectedIndex ] = useState(-1);
  const [ selectedState, setSelectedState ] = useState<State|null>(null);

  const { data, loading, error } = useQuery<FetchAllStatesResponse>(FETCH_ALL_STATES);

  useEffect(() => {
    if (!data?.states) {
      return;
    }

    // if we have selected a state, show it
    if (selectedIndex !== -1) {
      setSelectedState(data.states[selectedIndex]);
      return;
    }

    // otherwise try to find the current state, or use the first item in the list
    const preselectedState = find(data.states, { abbreviation: currentState }) || data.states[0];
    setSelectedState(preselectedState);
    return
  }, [data?.states, selectedIndex])

  if (loading) {
    return (
      <ScreenLoadingIndicator />
    )
  }

  if (data?.states.length) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.headerText}>Select a State</Text>
        <Picker
          selectedValue={selectedState ? selectedState.name : data.states[0]}
          onValueChange={(value, index) => {
            setSelectedIndex(index);
          }}
        >
          {data.states.map((state, i) => {
            return (<Picker.Item
              value={state.name}
              label={state.name}
              key={i}
            />)
          })}
        </Picker>
        <Button title="next"
          accessibilityLabel='next'
          onPress={() => {
            navigation.replace('_citySelection', {
              currentState: selectedState as State,
              currentCity,
            });
          }}
        />
      </View>
    )
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text>Could not fetch states</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  }
})
