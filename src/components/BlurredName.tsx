import React from 'react';
import { Image } from 'react-native';
import { getBlurredImageBy } from '../../redux/slices/guestbook/helpers';
import Blurred1 from '../../assets/images/blurred-names/1.png';
import Blurred2 from '../../assets/images/blurred-names/2.png';
import Blurred3 from '../../assets/images/blurred-names/3.png';
import Blurred4 from '../../assets/images/blurred-names/4.png';
import Blurred5 from '../../assets/images/blurred-names/5.png';
import Blurred6 from '../../assets/images/blurred-names/6.png';
import Blurred7 from '../../assets/images/blurred-names/7.png';
import Blurred8 from '../../assets/images/blurred-names/8.png';
import Blurred9 from '../../assets/images/blurred-names/9.png';
import Blurred10 from '../../assets/images/blurred-names/10.png';

interface Props {
  blurredImageRef: number
}

const map = new Map([
  [0, Blurred1],
  [1, Blurred2],
  [2, Blurred3],
  [3, Blurred4],
  [4, Blurred5],
  [5, Blurred6],
  [6, Blurred7],
  [7, Blurred8],
  [8, Blurred9],
  [9, Blurred10],
]);

/**
 * Important, the blurredImageRef prop must be between 0 and map.size
 * @param blurredImageRef
 * @returns
 */
export const BlurredName = ({ blurredImageRef }: Props): JSX.Element => {
  const ref = getBlurredImageBy(blurredImageRef % 10, map);
  return (
    <Image source={ref as never} resizeMode={'contain'} />
  )
}
