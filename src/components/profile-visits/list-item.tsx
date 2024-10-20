import * as React from 'react'
import { ListItem } from 'react-native-elements'

interface Props {
  heading: string
  subtext: string
}

export const ProfileVisitListItem = ({ heading, subtext }: Props) => {
  return (
    <ListItem
      containerStyle={[{ height: 100 }]}
      pad={20}
    >
      <ListItem.Content>
        <ListItem.Title>
          {heading}
        </ListItem.Title>
        <ListItem.Subtitle>
          {subtext}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  )
}
