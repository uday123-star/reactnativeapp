import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import { globalStyles } from '../../../styles/global-stylesheet'
import { Modal as Confirmation } from '../Modal'
import { Text } from '../Text'

interface Props {
  isBlockModalVisible: boolean
  onCloseConfirmationBox(): void
  doConfirmed(): void
}

export const UnblockUserConfirmationBox = ({ isBlockModalVisible, onCloseConfirmationBox, doConfirmed }: Props) => {
  return (
    <Confirmation
      isVisible={isBlockModalVisible}
      onClose={onCloseConfirmationBox}
    >
      <View>
        <Text style={styles.textStyle}>
          After unblocking a user, they will be able to see your profile or content, and you will be able to see their profile or content.
        </Text>
        <View style={styles.buttonsWrapper}>
          <Button
            title={'UNBLOCK'}
            accessibilityLabel='unblock profile'
            accessibilityRole='button'
            titleStyle={styles.titleStyle}
            type="solid"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.unblockButton}
            onPress={() => {
              doConfirmed()
            }}
          />
          <Button
            title={'CANCEL'}
            accessibilityLabel='cancel'
            accessibilityRole='button'
            titleStyle={styles.titleStyle}
            type="solid"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.cancelButton}
            onPress={onCloseConfirmationBox}
          />
        </View>
      </View>
    </Confirmation>
  )
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: 'row',
    height: 45,
    justifyContent: 'space-evenly'
  },
  buttonContainer: {
    paddingVertical: 0,
    borderRadius: 0,
    flex: 1,
  },
  unblockButton: {
    ...globalStyles.buttonStyle,
    borderRadius: 0
  },
  cancelButton: {
    ...globalStyles.buttonStyle,
    borderRadius: 0,
    backgroundColor: '#CCC'
  },
  titleStyle: {
    fontWeight: 'bold'
  },
  textStyle: {
    padding: 20,
    fontSize: 16
  }
})
