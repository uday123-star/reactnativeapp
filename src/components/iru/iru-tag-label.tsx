import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native';
import { Iru } from '../../../data/queries/iru/words';
import { Colors } from '../../../styles/colors';
import { Text } from '../Text';

export interface TagToAddOrUpdate {
  iru: Iru
  byMe: boolean
  byOther: boolean
  prevTag?: string | undefined | null
}
export interface TagsAddOrUpdate {
  [id: string]: TagToAddOrUpdate
}

interface ContentProps {
  tag: TagToAddOrUpdate
  tagsAddOrUpdate: TagsAddOrUpdate
  onChangeTagged: (tagsAddOrUpdate: TagsAddOrUpdate) => void
}

export const IruTagLabel = ({ tag, tagsAddOrUpdate, onChangeTagged }: ContentProps): JSX.Element => {
  const {
    word,
    id
  } = tag.iru;

  const [byMe, setByMe] = useState(false);

  return (<Pressable
    style={styles.modalTagButton}
    onPress={() => {
      if (!byMe) {
        setByMe(true);
        return onChangeTagged({
          ...tagsAddOrUpdate,
          [id]: {
            ...tag,
            byMe: true,
          }
        });
      }
      delete tagsAddOrUpdate[id];
      setByMe(false);
      return onChangeTagged(tagsAddOrUpdate);
    }}
    key={id}
    accessibilityLabel={word}
    accessibilityRole='button'
    accessible={true}
  >
    <View
      style={[
        styles.modalTag,
        byMe ? styles.modalTagSelected : {}
      ]}
    >
      <Text
        style={styles.modalTagText}
      >
        {word}
      </Text>
    </View>
  </Pressable>)
}

const styles = StyleSheet.create({
  modalTag: {
    backgroundColor: Colors.gray,
    padding: 10,
    borderRadius: 18,
  },
  modalTagSelected: {
    backgroundColor: Colors.ligthCyan,
  },
  modalTagButton: {
    marginRight: 10,
    marginBottom: 10
  },
  modalTagText: {
    color: Colors.blackRGBA(),
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 16,
    padding: 0,
    margin: 0
  },
  tagIcon: {
    marginLeft: 5,
    color: 'gray'
  },
  tagIconByMe: {
    color: Colors.darkCyan
  },
});
