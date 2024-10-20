import React, { useRef } from 'react'
import { KeyboardAvoidingView, LayoutChangeEvent, Platform, TextInput, View } from 'react-native'
import { Text } from '../Text'
import { Button } from '../Button'
import { useCurrentAffiliation, useCurrentUser } from '../../../redux/hooks'
import { Colors } from '../../../styles/colors'
import { UserAvatar } from '../UserAvatar'
import { useState, useEffect } from 'react'
import { Message, School } from '../../../data/queries/conversations/types'
import { useAffiliationYearRange } from '../../hooks'
import { getClassTitle } from '../../../redux/slices/current-affiliation/helpers'

interface Props {
  placeholder: string
  onPost: (message: Message[]) => Promise<void>
  message?: Message[]
  school?: School
}

export const NewPost = ({ placeholder, onPost, message, school }: Props) => {
  const inputBox = useRef<TextInput>();
  const currentUser = useCurrentUser();
  const { schoolName } = useCurrentAffiliation()
  const { end: endYear, isStudent } = useAffiliationYearRange();

  const inputText = message?.map((m) => m.text).join('\n');
  const [draftText, setDraftText] = useState(inputText ? inputText : '')
  const [availableTextInputHeight, setAvailableTextInputHeight] = useState(0)
  const [isPostDisabled, setIsPostDisabled] = useState(true)
  const [ charactersRemaining, setCharactersRemaining ] = useState(inputText ? (4000 - inputText.length) : 4000);

  const onTextInputLayout = (e: LayoutChangeEvent) => {
    setAvailableTextInputHeight(Math.floor(e.nativeEvent.layout.height));
    inputBox.current?.focus();
  }

  const isValidConversation = (text = '') => {
    if (inputText) {
      if (text !== inputText && Boolean(text.trim())) {
        return true;
      }
      return false;
    }
    return Boolean(text.trim());
  }

  useEffect(() => {
    setIsPostDisabled(!isValidConversation(draftText))
  }, [draftText])

  const onError = () => {
    alert('oops, an error')
  }

  const _onPost = () => {
    setIsPostDisabled(true)
    const message: Message[] = draftText.split('\n').map((t) => ({
      text: t,
      entityRanges: []
    }));
    onPost(message)
      .catch(onError)
      .finally(() => setIsPostDisabled(false))
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1
      }}
      keyboardVerticalOffset={100}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: Colors.whiteRGBA()
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            margin: 10,
            alignItems: 'center'
          }}
        >
          <UserAvatar
            user={currentUser}
            avatarSize={50}
            onPress={() => false}
          />
          <View
            style={{
              flexDirection: 'column',
              marginLeft: 10
            }}
          >
            <Text isBold>{currentUser.firstName} {currentUser.lastName}</Text>
            <Text>{schoolName} - </Text>
            <Text>{getClassTitle(isStudent ? endYear : school?.year ? String(school?.year) : endYear)}</Text>
          </View>
        </View>

        <View
          onLayout={onTextInputLayout}
          style={{
            flexGrow: 1
          }}
        >
          <TextInput
            autoFocus={true}
            ref={inputBox as React.LegacyRef<TextInput>}
            style={{
              margin: 10,
              fontSize: 18,
              color: Colors.blackRGBA(),
              maxHeight: availableTextInputHeight - 10 // availableTextInputHeight - half postButtonPadding
            }}
            placeholder={placeholder || 'What\'s on your mind'}
            placeholderTextColor={Colors.blackRGBA(0.5)}
            maxLength={4000}
            multiline={true}
            value={draftText}
            onChangeText={(text) => {
              setCharactersRemaining(4000 - text.length);
              setDraftText(text)
            }}
          />
        </View>
        <View>
          <Text
            style={{
              textAlign: 'right',
              fontSize: 12,
              lineHeight: 12,
              marginRight: 40,
              color: Colors.darkGray
            }}
          >You have {charactersRemaining} character{charactersRemaining === 1 ? '' : 's'} remaining</Text>
        </View>
        <View>
          <Button
            title='POST'
            style={{ margin: 20, marginBottom: 40 }}
            disabled={isPostDisabled}
            onPress={_onPost}
            isPartialWidth={true}
            accessibilityLabel='post' 
            accessible={true}          
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
