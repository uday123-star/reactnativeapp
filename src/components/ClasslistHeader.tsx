import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../../styles/global-stylesheet';
import { getClassTitle, getClassCountString } from '../../redux/slices/current-affiliation/helpers';
import { useAffiliationYearRange } from '../hooks';

interface ClassListHeaderProps {
  studentCount: number
  doSearch: (query: string) => void
  reset: () => void
}

export const ClasslistHeader = ({ studentCount, doSearch, reset }: ClassListHeaderProps): JSX.Element => {
  const [ value, setValue ] = useState('');
  const { start, end, isStudent } = useAffiliationYearRange();
  useEffect(() => {
    setValue('');
    reset();
  }, [end])
  return (
    <View>
      <Card>
        <View style={{ marginBottom: 10, flexGrow: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon.Button name="graduation-cap"
              size={28}
              color={'black'}
              backgroundColor={'#FFF'}
              iconStyle={{ marginTop: -5, marginRight: -3 }}
            />
            <Text style={{ fontSize: 16 }}><Text style={globalStyles.sectionHeaderText}>{getClassTitle(end, isStudent, start)}</Text>{'\n'}{getClassCountString(studentCount)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 4, borderColor: 'silver', borderBottomColor: 'silver', borderLeftColor: 'silver', padding: 2 }}>
          <TextInput
            accessibilityLabel='Search box'
            accessible={true}
            accessibilityRole='search'
            placeholderTextColor="#888888"
            style={{ flex: 1, backgroundColor: 'white', width: '100%', height: 50, padding: 5, fontSize: 16 }}
            onChangeText={(query) => { setValue(query); doSearch(query) }}
            placeholder="Who are you looking for?"
            value={value}
          />
          <TouchableOpacity
            accessibilityLabel='Search button'
            accessible={true}
            accessibilityRole='button'
            style={{ display: 'flex', justifyContent: 'center', padding: 10 }}
          >
            <Icon name="search"
              size={24}
              style={{ alignSelf: 'flex-end' }}
            />
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  )
}
