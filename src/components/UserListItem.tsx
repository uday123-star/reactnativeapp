import React from 'react';
import { TouchableHighlight, Text, StyleProp, StyleSheet, ViewStyle, TouchableWithoutFeedbackProps, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { titleize } from '../helpers/string';
import { AffiliationDetails, AffiliationModel, PersonModel } from '../../types/interfaces';
import { UserAvatar } from './UserAvatar';
import colors from 'react-native-elements/dist/config/colors';
import { Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';
import { StudentModel } from '../../types/interfaces';
import { getClassTitle } from '../../redux/slices/current-affiliation/helpers';

interface UserListItemProps {
  affiliation: AffiliationModel|AffiliationDetails|null
  student?: Partial<PersonModel>
  isInFlashList?: boolean
  containerStyle?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  avatarSize?: number
  isLoading?: boolean
  onPress?: TouchableWithoutFeedbackProps['onPress']
}

export default class UserListItem extends React.PureComponent<UserListItemProps> {

  render(): JSX.Element | null {
    const { isInFlashList = false, student, affiliation, containerStyle, accessibilityLabel = '', avatarSize, onPress } = this.props;
    const listItemStyles = isInFlashList ? styles.listItemStyles : {};
    const { isLoading = false } = this.props;

    const showLoadingState = () => {
      return (
        <Placeholder>
          <ListItem style={[containerStyle, listItemStyles]}
            pad={20}
            hasTVPreferredFocus={undefined}
            tvParallaxProperties={undefined}
          >
            <PlaceholderMedia style={{ height: avatarSize || 75, width:avatarSize || 75 }} />
            <ListItem.Content>
              <PlaceholderLine />
              <PlaceholderLine />
            </ListItem.Content>
          </ListItem>
        </Placeholder>
      )
    };

    const _gradYearText = () => {
      if (affiliation) {
        const isStudent = affiliation.role === 'STUDENT';
        return (<Text>{getClassTitle(affiliation?.gradYear || affiliation?.endYear,isStudent, affiliation?.startYear, true)}</Text>);
      }
      return null;
    }

    if (!student) {
      return null;
    }

    return (
      <View>
        {
          isLoading
            ? showLoadingState()
            : (
              <ListItem
                Component={TouchableHighlight}
                accessibilityLabel={accessibilityLabel}
                accessible={true}
                accessibilityRole='none'
                style={[containerStyle, listItemStyles]}
                onLongPress={() => console.log('onLongPress() funtion activated')}
                onPress={onPress}
                pad={20}
                hasTVPreferredFocus={undefined}
                tvParallaxProperties={undefined}
              >
                <UserAvatar
                  user={student as StudentModel}
                  avatarSize={avatarSize}
                  strict={false}
                  onPress={onPress}
                />

                <ListItem.Content>
                  <ListItem.Title
                    accessibilityLabel='Profile name'
                    accessibilityRole='text'
                  >
                    <Text>{titleize(`${student?.firstName} ${student?.lastName}`)}
                    </Text>
                  </ListItem.Title>
                  <ListItem.Subtitle
                    accessibilityLabel='Generation Class'
                    accessibilityRole='text'
                  >
                    {_gradYearText()}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            )
        }
      </View>
    )
  }
}

/**
 * These styles were stolen from react-native elements.
 * They give the list the same border, and margin as the card, to help match up
 * with desired classlist styles.
 * @see https://github.com/react-native-elements/react-native-elements/blob/next/src/Card/Card.tsx
 */
const styles = StyleSheet.create({
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
