import React from 'react';
import { TouchableHighlight, Text, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import colors from 'react-native-elements/dist/config/colors';

export const SearchErrorListItem = () => {

    return (
      <View>
        <ListItem
          Component={TouchableHighlight}
          style={[listItemStyles]}
          pad={20}
        >

          <ListItem.Content>
            <ListItem.Title>
              <Text>Something Ain&apos;t right</Text>
            </ListItem.Title>
            <ListItem.Subtitle>
              <Text>Cross your fingers and try again</Text>
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }

/**
 * These styles were stolen from react-native elements.
 * They give the list the same border, and margin as the card, to help match up
 * with desired classlist styles.
 * @see https://github.com/react-native-elements/react-native-elements/blob/next/src/Card/Card.tsx
 */
const { listItemStyles } = StyleSheet.create({
  listItemStyles: {
    marginHorizontal: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderColor: colors.grey5,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0, .2)',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 1,
  }
});
