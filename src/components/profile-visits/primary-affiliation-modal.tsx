import * as React from 'react'
import { Modal } from '../Modal'
import { Text, View } from 'react-native'
import { globalStyles } from '../../../styles/global-stylesheet'

interface Props {
  isModalVisible: boolean
  onClose(): void
}

export const PrimaryAffiliationModal = ({ isModalVisible = false, onClose }: Props): JSX.Element => {

  return (
    <Modal isVisible={isModalVisible} onClose={onClose}>
      <View>
        <Text style={[globalStyles.boldText, { margin: 20 }]}>PRIMARY AFFILIATION</Text>
        <Text style={{ margin: 20, marginTop: 0, fontSize: 16 }}>When choosing your primary affiliation you&apos;ll typically want to select the high school to which you feel most connected (usually a school that you attended) and about which you would like to receive updates. You will still be able to navigate to all of your schools and view activity.</Text>
      </View>
    </Modal>
  )
}
