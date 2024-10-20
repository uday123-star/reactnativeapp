import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import BaseModal, { Direction } from 'react-native-modal'
import CloseCircle from '../../assets/images/close-circle.svg'

interface Props {
  isVisible: boolean
  children: JSX.Element
  swipeDirection?: Direction | Direction[]
  shouldShowHeader?: boolean
  propagateSwipe?: boolean
  onClose(): void
  onModalHide?(): void
}

export const Modal = ({ isVisible, children, onClose, onModalHide, shouldShowHeader = true, swipeDirection = ['up', 'down', 'left', 'right'], propagateSwipe = false }: Props): JSX.Element => {

  return (
    <BaseModal
      isVisible={isVisible}
      swipeDirection={swipeDirection}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      style={styles.modalContainer}
      propagateSwipe={propagateSwipe}
      onModalHide={onModalHide}
    >
      <View style={styles.modal}>
        {shouldShowHeader &&
          <View style={[styles.headerContainer, styles.divider]}>
            <TouchableOpacity
              accessibilityLabel='close modal'
              accessibilityRole='button'
              style={[styles.closeCircleContainer]}
              onPress={onClose}
            >
              <CloseCircle />
            </TouchableOpacity>
          </View>
        }
        {children}
      </View>
    </BaseModal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden'
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row-reverse',
    height: 60,
  },
  divider: {
    borderColor: 'silver',
    borderBottomWidth: 1,
  },
  closeCircleContainer: {
    height: 60,
    display: 'flex',
    justifyContent: 'center',
  }
});
