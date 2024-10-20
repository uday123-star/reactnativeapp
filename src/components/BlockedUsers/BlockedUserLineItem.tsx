import { format, parseISO } from 'date-fns'
import * as React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { BlockListPerson } from '../../../data/queries/security/block'
import { Colors } from '../../../styles/colors'
import { globalStyles } from '../../../styles/global-stylesheet'
import { PersonModel, StudentModel } from '../../../types/interfaces'
import { Text } from '../Text'
import { UserAvatar } from '../UserAvatar'

interface Props {
  item: BlockListPerson
  onToggleSwitch: ({ isEnabled, person, item }: OnToggleSwitch) => void
  resetSwitchesSignal: number
}

export interface OnToggleSwitch {
  isEnabled: boolean
  person: Partial<PersonModel> | undefined
  item: BlockListPerson
}

export const BlockedUserLineItem = ({ item, onToggleSwitch, resetSwitchesSignal = 0 }: Props): JSX.Element => {
  const [isEnabled, setIsEnabled] = React.useState(true)
  const { person, creation_date } = item;

  const toggleSwitch = () => {
    setIsEnabled(prev => !prev)
    onToggleSwitch({ isEnabled, person, item })
  }

  React.useEffect(() => {
    // every time we get a signal that
    // an unblock was cancelled, we
    // need to set all switches back to true.
    // because anything in the render item
    // is still blocked.
    setIsEnabled(true)
  }, [resetSwitchesSignal])

  if (!person) {
    return <View />;
  }

  return (
    <View style={styles.listableItemStyle}>
      <UserAvatar
        user={person as StudentModel}
        avatarSize={60}
        shouldUseThenPhoto={false}
        strict={false}
        onPress={() => false}
      />
      <View style={styles.nameContainer}>
        <Text style={globalStyles.boldText}>{person.firstName} {person.lastName}</Text>
        <Text>Blocked on {format(parseISO(creation_date), 'MMM do, YYY')}</Text>
      </View>
      <Switch
        value={
          isEnabled
        }
        trackColor={{
          true: Colors.cyan,
          false: Colors.whiteRGBA()
        }}
        thumbColor={Colors.whiteRGBA()}
        onValueChange={toggleSwitch}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listableItemStyle: {
    height: 100,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomColor: 'silver',
    marginHorizontal: 10,
    backgroundColor: Colors.whiteRGBA(),
  },
  nameContainer: {
    flexDirection: 'column',
    marginHorizontal: 10
  }
});
