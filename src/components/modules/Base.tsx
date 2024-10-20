import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { globalStyles } from '../../../styles/global-stylesheet'
import { Text } from '../Text'

interface Props {
  icon: JSX.Element
  heading: string
  children: JSX.Element
}

export const BaseModule = ({ icon, heading, children }: Props) => {
  return (
    <View>
      <View style={styles.headerSpacing}>
        {icon}
        <Text style={globalStyles.sectionHeaderText}>{heading}</Text>
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  headerSpacing: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: -15,
    marginLeft: 10,
  }
});
