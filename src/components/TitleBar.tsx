import isArray from 'lodash/isArray';
import * as React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Colors } from '../../styles/colors';

interface Props {
  children: JSX.Element|(JSX.Element|false)[]
  onLayout?: (event: LayoutChangeEvent) => void
}

export const TitleBar = ({ children, onLayout }: Props) => {
  if (!isArray(children)) {
    children = [children]
  }

  return (
    <View
      style={styles.outerWrapper}
      onLayout={onLayout}
    >
      <View style={styles.innerWrapper}>
        {children.filter(Boolean)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: Colors.darkCyan
  },
  innerWrapper: {
    padding: 23,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
