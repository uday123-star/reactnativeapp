import React, { FlatList, View } from 'react-native';
import { globalStyles } from '../../../styles/global-stylesheet';
import { Text } from '../Text';
import Icon from 'react-native-vector-icons/Octicons'
import { Colors } from '../../../styles/colors';

interface Props {
  onOpenTOS: (section?: string) => void
  onOpenHelp?: (ticket_form_id?: string) => void
  isSuccessMessage?: boolean
}

export const ConversationReports = ({ onOpenTOS, onOpenHelp, isSuccessMessage = false }: Props): JSX.Element => {
  if (isSuccessMessage) {
    return (<View>
      <Text
        style={[globalStyles.boldText, {
          fontSize: 16,
          marginTop: 10
        }]}
      >Thank you for reporting this content.</Text>
      <Text style={[globalStyles.boldText, {
        fontSize: 14,
        marginTop: 10
      }]}
      >We appreciate your assistance in maintaining the <Text
        style={[globalStyles.boldText, {
          color: Colors.darkCyan,
          fontSize: 14
        }]}
        onPress={() => onOpenTOS('#p-3')}
      >Classmates® Community Standards.</Text></Text>
      <Text style={{
        marginTop: 10,
        fontSize: 14
      }}
      >Please note, however, that situations and interpretations may vary. Although we will consider your feedback carefully, <Text
        style={[globalStyles.boldText, {
          fontSize: 14
        }]}
      >you should not expect a direct reply from Classmates, and we may not take the specific action you request.</Text> We recommend that you not correspond with any members whose message are offensive or unwelcome.</Text>
      <Text style={{
        marginTop: 10,
        fontSize: 14
      }}
      >If you have additional concerns about this content, you may notify our Member Care department through the <Text
        style={{
          color: Colors.darkCyan,
          fontSize: 14
        }}
        onPress={() => onOpenHelp ? onOpenHelp('114093990171') : null}
      >Classmates Help Page.</Text></Text>
    </View>);
  }
  return (<View>
    <Text
      style={[globalStyles.boldText, {
        fontSize: 16,
        marginTop: 10
      }]}
    >Classmates® appreciates your effort in keeping our site safe, friendly, and usable for all members by reporting inappropriate use of the Classmates Conversations.</Text>
    <Text style={[globalStyles.boldText, {
      fontSize: 14,
      marginTop: 10
    }]}
    >Inappropriate use may include, but is not limited to, sending messages that:</Text>
    <FlatList
      style={{
        marginTop: 10
      }}
      data={[
        'Offer unsolicited services or products',
        'Involve explicit sexual material or pornography',
        'Threat, harass, or abuse any other party',
        'Are sent after the recipient has requested no further contact'
      ]}
      renderItem={(info) => (<View
        style={{
          flex: 1,
          flexDirection: 'row'
        }}
      >
        <View>
          <Icon
            name='dot-fill'
            size={10}
            style={{
              marginTop: 3,
            }}
          />
        </View>
        <View
          style={{
            paddingLeft: 5
          }}
        >
          <Text
            key={info.index}
            style={{
              fontSize: 14
            }}
          >{info.item}</Text>
        </View>
      </View>)}
      scrollIndicatorInsets={{ right: 1 }}
    />
    <Text style={{
      marginTop: 10,
      fontSize: 14
    }}
    >
      (For more details see the <Text
        style={{
          color: Colors.darkCyan,
          fontSize: 14
        }}
        onPress={() => onOpenTOS('#p-3')}
      >Member Conduct</Text> section of the Classmates <Text
        style={{
          color: Colors.darkCyan,
          fontSize: 14
        }}
        onPress={() => onOpenTOS()}
      >Terms of Service</Text>)
    </Text>
  </View>)
}
