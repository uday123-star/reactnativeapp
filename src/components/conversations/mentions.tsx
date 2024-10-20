import React from 'react'
import { Message } from '../../../data/queries/conversations/types'
import ParsedText from 'react-native-parsed-text';
import { Colors } from '../../../styles/colors';
import { Text } from '../Text';

interface Props {
  messages: Message[]
  onPress: (registration_id: string) => void
}

export const MentionsText = ({ messages, onPress }: Props) => {
  return <Text>{messages.map((message, index) => {
    const { entityRanges, text } = message;
    return (<ParsedText
      key={`${new Date().getTime()}-${index}`}
      parse={(entityRanges || []).filter(({ entity }) => entity.type === 'mention').map(({ entity }) => {
        const data: {
          mention: {
            name: string
            registration_id: string
          }
        } = JSON.parse(entity.data);
        return {
          pattern: new RegExp(`@${data.mention.name}`, 'gi'),
          style: {
            color: Colors.mention
          },
          onPress: () => {
            onPress(data.mention.registration_id)
          },
        }
      })}
    >{text + '\n'}</ParsedText>)
  })}</Text>;
};
