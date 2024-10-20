import * as React from 'react'
import { View } from 'react-native'
import { Text } from '../../Text'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Colors } from '../../../../styles/colors'
import { GET_PEOPLE, PeopleResponse } from '../../../../data/queries/people/person-data'
import { useQuery } from '@apollo/client'
import { Placeholder, Fade, PlaceholderLine } from 'rn-placeholder'
import { BirthDateConfidenceLevel, PersonModel } from '../../../../types/interfaces'
import { format } from 'date-fns'

interface Props {
  personId: string
  hasBirthdateAvailable: boolean
}

export const BirthDateSection = ({ personId, hasBirthdateAvailable = true }: Props) => {

  const { data, loading, error } = useQuery<PeopleResponse>(GET_PEOPLE, {
    variables: {
      personId,
      ignorePrivacyElements: !hasBirthdateAvailable
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  })

  const [ person, setPerson ] = React.useState<PersonModel>();

  React.useEffect(() => {
    if (!loading && data) {
      const [person] = data?.people as PersonModel[];
      setPerson(person)
    }
  }, [data, loading])

  if (error) {
    return (
      <View>
        <Text fontSizePreset={2}>Oops, an error has occured</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View>
        <Text fontSizePreset={2} isBold>Birthday</Text>
        <Placeholder Animation={Fade} style={{ marginVertical: 20 }}>
          <PlaceholderLine height={40} />
        </Placeholder>
      </View>
    )
  }

  if (person?.birthDate) {
    const dt = new Date(person.birthDate);
    const dtDateOnly = new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000);
    const displayDate = format(dtDateOnly, 'd MMMM');

    if (person?.birthDateConfidenceLevel === BirthDateConfidenceLevel.FULL) {
      return (
        <View>
          <Text fontSizePreset={2} isBold>Birthday</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, backgroundColor: Colors.backgroundGray, padding: 10 }}>
            <Icon name='birthday-cake'
              color={Colors.darkCyan}
              size={24}
            />
            <Text
              accessibilityLabel='birthdate'
              accessibilityRole='text'
              fontSizePreset={2}
              style={{ paddingHorizontal: 10 }}
            >{displayDate}</Text>
          </View>
        </View>
      )
    }
    return null;
  }

  return null
}
