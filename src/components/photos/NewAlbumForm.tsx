import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, TextInput, View } from 'react-native';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/global-stylesheet';
import { isAndroid } from '../../helpers/device';
import { Text } from '../Text';

interface Props {
  onSuccess: (data: {
      title: string
      description: string
    }) => void
  onCancel: () => void
}

export const NewAlbumForm = ({ onSuccess, onCancel }: Props) => {
  const [ albumTitle, setAlbumTitle ] = useState('');
  const [ albumDescription, setAlbumDescription ] = useState('');
  const [ canSubmit, setCanSubmit ] = useState(false);
  const maxTitleSize = 48;
  const maxDescriptionSize = 200;
  const [ titleChars, setTitleChars ] = useState(maxTitleSize);
  const [ descriptionChars, setDescriptionChars ] = useState(maxDescriptionSize);

  useEffect(() => {
    setTitleChars(maxTitleSize - albumTitle.length);
  }, [ albumTitle ]);

  useEffect(() => {
    setDescriptionChars(maxDescriptionSize - albumDescription.length);
  }, [ albumDescription ]);

  useEffect(() => {
    if (titleChars < 0 || descriptionChars < 0) {
      setCanSubmit(false);
    } else if (albumTitle.length) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [ titleChars, descriptionChars, albumTitle ])

  return (<KeyboardAvoidingView
    behavior={isAndroid() ? 'height' : 'padding'}
    keyboardVerticalOffset={isAndroid() ? 80 : 100}
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundColor: Colors.blackRGBA(0.5),
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <View
      style={{
        backgroundColor: '#fff',
        width: '60%',
        padding: 10,
        borderRadius: 10
      }}
    >
      <View
        style={{
          position: 'relative',
          height: 16,
        }}
      >
        <Text
          style={[globalStyles.boldText,{
            position: 'absolute',
            top: 0,
            left: 0
          }]}
        >Title:</Text>
        <Text
          style={[globalStyles.normalText,{
            fontSize: 12,
            color: titleChars > 0 ? Colors.darkGray : Colors.red,
            position: 'absolute',
            right: 0,
            top: 2
          }]}
        >{titleChars}</Text>
      </View>
      <TextInput
        style={{
          backgroundColor: '#f3f3f3',
          marginTop: 10,
          fontSize: 14,
          padding: 10,
          borderRadius: 34
        }}
        onChangeText={(text) => setAlbumTitle(text)}
      />
      <View
        style={{
          position: 'relative',
          height: 16,
          marginTop: 10
        }}
      >
        <Text
          style={globalStyles.boldText}
        >Description:</Text>
        <Text
          style={[globalStyles.normalText,{
            fontSize: 12,
            color: descriptionChars > 0 ? Colors.darkGray : Colors.red,
            position: 'absolute',
            right: 0,
            top: 2
          }]}
        >{descriptionChars}</Text>
      </View>
      <TextInput
        style={{
          backgroundColor: '#f3f3f3',
          marginTop: 10,
          fontSize: 14,
          padding: 10,
          height: 60,
          borderRadius: 60,
        }}
        multiline={true}
        numberOfLines={4}
        onChangeText={(text) => setAlbumDescription(text)}
      />
      <View
        style={{
          height: 50,
          marginTop: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <Pressable
            style={{
              flex: 1,
              paddingRight: 5
            }}
            onPress={() => onSuccess({
              title: albumTitle,
              description: albumDescription
            })}
            disabled={!canSubmit}
          >
            <View
              style={{
                borderRadius: 50,
                overflow: 'hidden'
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  width: '100%',
                  textAlign: 'center',
                  lineHeight: 20,
                  padding: 15,
                  backgroundColor: canSubmit ? Colors.cyan : Colors.gray,
                  color: '#fff',
                }}
              >SAVE</Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              paddingLeft: 5
            }}
            onPress={() => onCancel()}
          >
            <View
              style={{
                borderRadius: 50,
                overflow: 'hidden'
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  width: '100%',
                  textAlign: 'center',
                  lineHeight: 20,
                  padding: 15,
                  backgroundColor: Colors.darkGray,
                  color: '#fff',
                }}
              >CANCEL</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>);
}
