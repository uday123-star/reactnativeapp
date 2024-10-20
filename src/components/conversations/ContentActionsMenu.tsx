import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, List } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types';
import { useIsSignedIn } from '../../../redux/hooks';
import { Colors } from '../../../styles/colors';
import { isIOS } from '../../helpers/device';
import { useContentType } from '../../hooks/conversations/useContentType';
import BasicAlert from '../BasicAlert';

export type actionTypes = 'conversation' | 'comment' | 'reply';

interface Props {
  type: actionTypes
  children: JSX.Element
  content: Conversation | Comment | Reply
  onDelete: () => void
  onEdit: () => void
  onReport: () => void
}

export const ContentActionsMenu = ({ type, children, content, onDelete, onEdit, onReport }: Props): JSX.Element => {
  const [ isMenuVisible, setIsMenuVisible ] = useState(false);
  const [ position, setPosition ] = useState({
    x: 0,
    y: 0
  });
  const [ maxWidth, setMaxWidth ] = useState(0);
  const { posted_by } = content;
  const isComment = type === 'comment';
  const isSignedInUser = useIsSignedIn(posted_by.registration_id);
  const contentType = useContentType(content)
  const contentName = contentType === 'Conversation' ? 'Post' : contentType
  const menuButtonWidth = 40;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row'
      }}
      onLayout={(event) => {
        setMaxWidth(event.nativeEvent.layout.width - menuButtonWidth);
      }}
    >
      {!!(maxWidth) && <View
        style={{
          flexBasis: 'auto',
          flexShrink: 0,
          flexGrow: 1,
          maxWidth,
        }}
      >
        {children}
      </View>}
      {!!(maxWidth) && <View
        style={{
          flexBasis: menuButtonWidth,
          flexShrink: 1,
          flexGrow: 0,
          paddingRight: 20,
          paddingTop: 20,
          position: 'relative',
          minWidth: menuButtonWidth
        }}
      >
        <FontAwesome5
          name='ellipsis-h'
          onPress={(event) => {
            const { nativeEvent } = event;
            setPosition({
              x: nativeEvent.pageX,
              y: nativeEvent.pageY
            });
            setIsMenuVisible(true)
          }}
          color={Colors.darkCyan}
          selectionColor="transparent"
          size={20}
          style={isIOS() ? {
            padding: 0,
            lineHeight: 0,
            width: 'auto',
          } : undefined}
        />
        <Menu
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          style={{
            width: isComment ? 180 : 150,
          }}
          overlayAccessibilityLabel='Close profile actions menu'
          anchor={position}
        >
          {isSignedInUser && <List.Item onPress={() => {
            setIsMenuVisible(false);
            onEdit();
          }}
            title={`Edit ${contentName}`}
            left={
              () => (<FontAwesome5 name='pencil-alt'
                size={16}
                style={{
                  padding: 0, margin: 0, alignSelf: 'center', marginLeft: 10
                }}
              />)
            }
            accessible={true}
            accessibilityLabel={`Edit ${contentName}`}
            accessibilityRole='button'
          />}
          {isSignedInUser && <List.Item onPress={() => {
            setIsMenuVisible(false);
            BasicAlert.show({
              title: 'Conversations',
              text: `Are you sure you want to delete your ${contentName}?`,
              acceptText: 'DELETE',
              onAccept: onDelete,
              onClose: () => setIsMenuVisible(false)
            })
          }}
            title={`Delete ${contentName}`}
            left={
              () => (<FontAwesome5 name='trash-alt'
                size={16}
                style={{
                  padding: 0, margin: 0, alignSelf: 'center', marginLeft: 10
                }}
              />)
            }
            accessible={true}
            accessibilityLabel={`Delete ${contentName}`}
            accessibilityRole='button'
          />}
          {!isSignedInUser && <List.Item onPress={() => {
            setIsMenuVisible(false);
            onReport();
          }}
            title="Report"
            left={
              () => (<FontAwesome5 name='flag'
                size={16}
                style={{
                  padding: 0, margin: 0, alignSelf: 'center', marginLeft: 10
                }}
              />)
            }
            accessible={true}
            accessibilityLabel='Report'
            accessibilityRole='button'
          />}
          {/* <List.Item onPress={() => {console.log('TAPED');}}
            title="Share"
            left={
              () => (<FontAwesome5 name='share-alt'
                size={16}
                style={{
                  padding: 0, margin: 0, alignSelf: 'center', marginLeft: 10
                }}
              />)
            }
            accessible={true}
            accessibilityLabel='Share'
            accessibilityRole='button'
          /> */}
        </Menu>
      </View>}
    </View>
  )
}
