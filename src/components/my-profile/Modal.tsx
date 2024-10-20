import React from 'react'
import { View, Text } from 'react-native';
import { useAppDispatch, useMyProfile } from '../../../redux/hooks'
import { closeModal, MyProfileModalState } from '../../../redux/slices/my-profile/slice';
import { Modal } from '../Modal'

export const MyProfileModal = () => {
  const dispatch = useAppDispatch();
  
  const { myProfileModalState } = useMyProfile();

  return (
    <Modal
      isVisible={myProfileModalState === MyProfileModalState.isOpen}
      onClose={() => dispatch(closeModal())}
    >
      <View style={{ padding: 15, paddingBottom: 20 }}>
        <Text style={{
          fontWeight: 'bold',
          paddingVertical: 15,
          fontSize: 24,
        }}
        >
          CM+ benefits include
        </Text>
        <Text>• See who visits your profile</Text>
        <Text>• Read your profile messages</Text>
        <Text>• Find out who rememebered you</Text>
        <Text>• Discounted yearbook reprints</Text>
        <Text>• Find friends with Classmates&reg; Location</Text>
      </View>
    </Modal>
  )
}
