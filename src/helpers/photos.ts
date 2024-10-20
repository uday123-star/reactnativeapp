import { Image } from 'react-native';

export const getImageSize = (uri: string): Promise<{
  width: number
  height: number
}> => {
  return new Promise((resolve) => {
    Image.getSize(uri, (width, height) => resolve({
      width,
      height
    }))
  });
}
