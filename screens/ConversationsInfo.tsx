import * as React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '../src/components/Text'
import { Colors } from '../styles/colors'
import OrangeBubble from '../assets/images/conversations-howzit-work.svg'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

export const ConversationsInfoScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={{
        backgroundColor: Colors.darkCyan
      }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20
      }}
      scrollIndicatorInsets={{ right: 1 }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: 30 }}>
        <View style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
          <OrangeBubble />
          <Text
            style={{
              fontSize: 40,
              paddingBottom: 10,
              textAlign: 'center'
            }}
            textWhite
            isBold
          >
            How does it work?
          </Text>

          <Text
            style={{
              paddingHorizontal: 30,
              textAlign: 'center',
              fontSize: 20
            }}
            textWhite
          >
            You can either join in on a conversation or start one on your own. Share your favorite stories about high school or just let your schoolmates know what you&apos;re up&nbsp;to.
          </Text>
        </View>

        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Text
            style={{ paddingVertical: 20 }}
            fontSizePreset={1}
            textWhite
            isBold
          >
            Helpful tips
          </Text>
          <View style={{ flexDirection: 'column' }}>
            <View style={styles.flexRow}>
              <View style={{ backgroundColor: Colors.purple, borderRadius: 50, height: 20, width: 20, marginTop: 2 }}>
                <Icon
                  name='checkmark'
                  color={'white'}
                  size={18}
                  style={{ textAlign: 'center' }}
                />
              </View>
              <Text
                style={styles.listText}
                textWhite
              >
                To begin a conversation, start typing your message in the top form field.
              </Text>
            </View>
            <View style={styles.flexRow}>
              <View style={{ backgroundColor: Colors.purple, borderRadius: 50, height: 20, width: 20, marginTop: 2 }}>
                <Icon
                  name='checkmark'
                  color={'white'}
                  size={18}
                  style={{ textAlign: 'center' }}
                />
              </View>
              <Text
                style={styles.listText}
                textWhite
              >
                Within a post, add a reaction, reply and view comments and follow the Conversation.
              </Text>
            </View>
            <View style={styles.flexRow}>
              <View style={{ backgroundColor: Colors.purple, borderRadius: 50, height: 20, width: 20, marginTop: 2 }}>
                <Icon
                  name='checkmark'
                  color={'white'}
                  size={18}
                  style={{ textAlign: 'center' }}
                />
              </View>
              <Text
                style={styles.listText}
                textWhite
              >
                Visit your schoolmates profile who posted the conversation.
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={{
            textTransform: 'uppercase',
            marginVertical: 30,
            paddingBottom: 30
          }}
          textWhite
          isBold
          onPress={() => {
            navigation.goBack()
          }}
        >
          Close
        </Text>

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  listText: {
    paddingLeft: 10,
    fontSize: 16,
    paddingBottom: 10,
    width: 230,
  }
})
