import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../src/components/Text'
import { Button } from '../src/components/Button'
import { Modal } from '../src/components/Modal'
import { isIOS } from '../src/helpers/device'
import { Colors } from '../styles/colors'
import { globalStyles } from '../styles/global-stylesheet'
import * as Linking from 'expo-linking'
import Image from '../assets/images/upgrade-available.svg'
import { ScrollView } from 'react-native-gesture-handler'

export const AppUpdateScreen = () => {

  const [shouldSeeSkipModal, setShouldSeeSkipModal] = React.useState(false);

  const updateNow = () => {
    if (isIOS()) {
      Linking.openURL('https://apps.apple.com/app/id1592740369')
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.peopleconnect.classmates')
    }
  }

  const showSkipConfirmation = () => {
    setShouldSeeSkipModal(true);
  }

  const skipUpdate = () => {
    setShouldSeeSkipModal(false)
    // set redux param for skipping update
    alert('set version that user has skipped updating')
  }

  return (
    <ScrollView
      scrollIndicatorInsets={{ right: 1 }}
      contentContainerStyle={styles.container}
    >
      <View style={{ flex: 8, justifyContent: 'flex-end' }}>
        <Image style={{ alignSelf: 'center' }} />
        <Text style={styles.headerText}>It&apos;s time to update!</Text>
        <Text style={styles.textStyle}>We&apos;ve done some work to make your experience even better.</Text>
      </View>
      <View style={{ flex: 5, justifyContent: 'center', width: '100%' }}>
        <Button
          title='UPDATE NOW'
          style={{ paddingHorizontal: 20 }}
          onPress={updateNow}
          accessibilityLabel='update now'
          accessible={true}
        />
        <Button title='NOT NOW'
          style={{ marginTop: 20 }}
          onPress={showSkipConfirmation}
          backgroundColor='transparent'
          textColor={Colors.darkCyan}
          accessibilityLabel='not now'
          accessible={true}
        />
      </View>
      {shouldSeeSkipModal && (
        <Modal
          isVisible={shouldSeeSkipModal}
          onClose={skipUpdate}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.confirmationTitle}>Are you sure?</Text>
            <Text style={styles.confirmationText}>If you don&apos;t update the app, there is a chance that you&apos;ll encounter some bugs.</Text>
            <Button
              title='Yes, I understand'
              style={{ marginVertical: 10 }}
              onPress={skipUpdate}
              textColor={Colors.darkCyan}
              backgroundColor='transparent'
              accessibilityLabel='yes I understand' 
              accessible={true} 
            />
          </View>
        </Modal>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    marginHorizontal: 20
  },
  headerText: {
    ...globalStyles.headerText,
    fontSize: 30
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 30,
    maxWidth: 300
  },
  modalContainer: {
    margin: 20
  },
  confirmationTitle: {
    ...globalStyles.headerText,
    textAlign: 'center'
  },
  confirmationText: {
    ...globalStyles.normalText,
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10
  }
})
