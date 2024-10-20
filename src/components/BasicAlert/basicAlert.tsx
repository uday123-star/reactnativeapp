import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../Button';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/global-stylesheet';
import { Modal } from '../Modal';
import { onBasicAlert } from './hook';

export interface BasicAlertInput {
  title: string
  text: string | JSX.Element
  isVisible: boolean
  onClose?: () => void
  buttonText?: string
  acceptText?: string
  onAccept?: () => void
  titleAccessibilityLabel?: string
  textAccessibilityLabel?: string
  buttonAccessibilityLabel?: string
}

export const BasicAlert = (): JSX.Element | null => {
  const basicAlertData = onBasicAlert();
  const { title, text, onClose, isVisible, buttonText, titleAccessibilityLabel, textAccessibilityLabel, buttonAccessibilityLabel, acceptText, onAccept }: BasicAlertInput = basicAlertData;
  const textContent = (): JSX.Element => {
    if (typeof text === 'string') {
      return (<Text
        style={[globalStyles.normalText, {
          fontSize: 20,
          marginTop: 20
        }]}
        accessible={true}
        accessibilityRole='text'
        accessibilityLabel={textAccessibilityLabel || 'Basic alert text'}
      >{text}</Text>)
    }
    return text;
  }

  const _getButtons = () => {
    if (acceptText) {
      return (<View
        style={{
          flexDirection: 'row',
          marginTop: 20
        }}
      >
        <View
          style={{
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: 'auto'
          }}
        >
          <Button
            title={acceptText}
            accessible={true}
            accessibilityLabel={buttonAccessibilityLabel || 'Close basic alert'}
            onPress={onAccept ? onAccept : () => null}
            style={{ fontSize: 20 }}
            borderRadius={20}
          />
        </View>
        <View
          style={{
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: 'auto',
            paddingStart: 10
          }}
        >
          <Button
            title={buttonText || 'CANCEL'}
            accessible={true}
            accessibilityLabel={buttonAccessibilityLabel || 'Close basic alert'}
            onPress={onClose ? onClose : () => null}
            style={{ fontSize: 20 }}
            textColor={Colors.darkCyan}
            backgroundColor='transparent'
          />
        </View>
      </View>)
    }
    return (<View
      style={{
        // flex: 1,
        alignItems: 'flex-end'
      }}
    >
      <Button
        title={buttonText || 'OKAY'}
        accessible={true}
        accessibilityLabel={buttonAccessibilityLabel || 'Close basic alert'}
        onPress={onClose ? onClose : () => null}
        style={
          {
            fontSize: 20,
            marginTop: 20
          }
        }
        textColor={Colors.darkCyan}
        backgroundColor='transparent'
      />
    </View>)
  }

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose ? onClose : () => null}
      shouldShowHeader={false}
    >
      <View
        style={{
          padding: 20
        }}
      >
        <Text
          style={[globalStyles.boldText,{
            fontSize: 25
          }]}
          accessible={true}
          accessibilityRole='text'
          accessibilityLabel={titleAccessibilityLabel || 'Basic alert title'}
        >{title}</Text>
        {textContent()}
        {_getButtons()}
      </View>
    </Modal>
  )
};
