import React from 'react';
import { ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { IruTagLabel, TagsAddOrUpdate, TagToAddOrUpdate } from './iru-tag-label';

interface props {
  scrollViewRef: React.LegacyRef<ScrollView>
  tagsToDisplayInModal: TagToAddOrUpdate[]
  tagsAddOrUpdate: TagsAddOrUpdate
  onChangeTagged: (tagsAddOrUpdate: TagsAddOrUpdate) => void
}

export const IruTagsContainer = ({ scrollViewRef, tagsToDisplayInModal, tagsAddOrUpdate, onChangeTagged }: props): JSX.Element => {
  const _modalTag = (tag: TagToAddOrUpdate) => {
    const {
      iru
    } = tag;
    const {
      id
    } = iru;
    return (<IruTagLabel
      tag={tag}
      tagsAddOrUpdate={tagsAddOrUpdate}
      onChangeTagged={onChangeTagged}
      key={`label-${id}`}
    />);
  }

  return (<ScrollView
    showsVerticalScrollIndicator={true}
    scrollIndicatorInsets={{ right: 1 }}
    persistentScrollbar={true}
    ref={scrollViewRef}
  >
    <TouchableWithoutFeedback>
      <View
        style={styles.modalTagsWrapper}
      >
        {
          tagsToDisplayInModal.map(_modalTag)
        }
      </View>
    </TouchableWithoutFeedback>
  </ScrollView>);
}

const styles = StyleSheet.create({
  modalTagsWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    alignSelf: 'center',
  },
});
