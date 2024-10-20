/* eslint-disable react/jsx-key */
import React from 'react';
import { selectWeebleByRegId } from '../../redux/slices/guestbook/helpers';
import Teal from '../../assets/images/weebles/teal1.svg';
import TealAlt from '../../assets/images/weebles/teal2.svg';
import Purple from '../../assets/images/weebles/purple1.svg';
import PurpleAlt from '../../assets/images/weebles/purple2.svg';
import Orange from '../../assets/images/weebles/orange1.svg';
import OrangeAlt from '../../assets/images/weebles/orange2.svg';
import { View } from 'react-native';

interface Props {
  id: string
}

export const WEEBLE_MAP = new Map<number, JSX.Element>([
  [0, <Teal />],
  [1, <TealAlt />],
  [2, <Purple />],
  [3, <PurpleAlt />],
  [4, <Orange />],
  [5, <OrangeAlt />],
]);

export const Weeble = ({ id }: Props): JSX.Element => {

  const weeble = selectWeebleByRegId(+id, WEEBLE_MAP);

  return (
    <View>
      {weeble}
    </View>
  )
}
