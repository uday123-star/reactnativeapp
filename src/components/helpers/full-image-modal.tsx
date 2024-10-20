import * as React from 'react'
import { View, Text } from 'react-native'
import { Modal } from '../Modal'
import { List } from 'react-native-paper'
import { globalStyles } from '../../../styles/global-stylesheet'

const { normalText, boldText, pageContainer } = globalStyles;

interface Props {
  isVisible: boolean
  closeModal(): void
}

export const FullImageModal = ({ isVisible, closeModal }: Props): JSX.Element => {

  return (
    <Modal
      isVisible={isVisible}
      onClose={closeModal}
    >
      <View>
        <View style={pageContainer}>
          <List.Section>
            <Text style={boldText}>Profile Visits</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>The Basics</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>When most Classmates members visit your profile, their names will automatically be listed on your Profile Visits page.</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>If you&apos;re not a Classmates+ member, you&apos;ll need to upgrade to see those names.</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>Any Classmates member can leave their names in any other member&apos;s Profile. You might not know everyone who signed yours.</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>Only you can see your Profile Visits page, and you can&apos;t see someone else&apos;s.</Text>
          </List.Section>
          <List.Section>
            <Text style={normalText}>When you visit other people&apos;s profiles, your name will be automatically listed on their Profile Visits page unless you visit your profile visit settings and select the quiet option.</Text>
          </List.Section>
        </View>
      </View>
    </Modal>
  )
}
