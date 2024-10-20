import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { Colors } from '../../styles/colors'
import { Photo, StudentModel } from '../../types/interfaces'
import { getStickyItemFromMapByString } from '../helpers/array'
import { GET_PEOPLE, PeopleResponse } from '../../data/queries/people/person-data'
import { useWeebleColor } from '../../redux/hooks'
import { useAppThunkDispatch } from '../../redux/store'
import { setWeebleColor } from '../../redux/slices/weeble-colors/slice'
import FastImage from 'react-native-fast-image'

const backgroundColors = new Map([
  [0, Colors.teal1], // teal 1
  [1, Colors.teal2], // teal 2
  [2, Colors.orange1], // orange 1
  [3, Colors.orange2], // orange 2
  [4, Colors.purple1], // purple 1
  [5, Colors.purple2], // purple 2
])

interface Props {
  user: StudentModel
  avatarSize?: number
  namePlate?: string
  shouldUseThenPhoto?: boolean
  /**
   * This strict parameter is used to enable a fallback photo.
   * For example, if we set `shouldUseThenPhoto` to `false`, and `strict` to false
   * if now photo does NOT exist and the then photo exists, we display then photo.
   */
  strict?: boolean
  onPress?: (event: GestureResponderEvent) => void
}

export const UserAvatar = ({ user, avatarSize = 0, namePlate = '', shouldUseThenPhoto = false, strict = true, onPress }: Props): JSX.Element | null => {

  const dispatch = useAppThunkDispatch();

  const { firstName = '', lastName = '', personId } = user || {};

  const weebleColor = useWeebleColor(personId);

  const hasPhoto = 'nowPhoto' in user && 'thenPhoto' in user;

  const [isValidImage, setIsValidImage] = useState(hasPhoto);

  const [getProfileData, { data: studentData, called, loading }] = useLazyQuery<PeopleResponse>(GET_PEOPLE, {
    variables: {
      personId
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  if (!hasPhoto && !called) {
    getProfileData();
  }

  useEffect(() => {
    if (studentData && studentData?.people.length) {
      setIsValidImage(true);
    }
  }, [studentData])

  const userData = studentData?.people[0];
  const userFirstName = userData?.firstName || '';
  const userLastName = userData?.lastName || '';
  const photoUrl = hasPhoto ?
    getDisplayPhotoFrom(user, shouldUseThenPhoto, strict) :
    getDisplayPhotoFrom(userData as StudentModel, shouldUseThenPhoto, strict);

  const borderRadius = 40;
  const height = avatarSize || 75;
  const width = avatarSize || 75;
  const initialFontSize = avatarSize ? Math.ceil(avatarSize * 0.5) : 28;
  const firstInitial = (firstName || userFirstName).charAt(0).toUpperCase();
  const lastInitial = (lastName || userLastName).charAt(0).toUpperCase();

  useEffect(() => {
    if (!weebleColor) {
      dispatch(setWeebleColor({
        id: personId,
        color: getStickyItemFromMapByString<string>(backgroundColors, personId)
      }))
    }
  }, [weebleColor])

  if (loading) {
    return null;
  }

  return (
    <Pressable onPress={onPress}>
      {isValidImage && photoUrl
        ? (
          <View style={{ width, height, borderRadius, overflow: 'hidden' }}>
            <FastImage
              style={{ width, height, borderRadius }}
              source={{ uri: photoUrl }}
              onError={() => setIsValidImage(false)}
            />
            {!!namePlate &&
              <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', position: 'relative', bottom: 23, paddingBottom: 7, paddingTop: 2 }}>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>{namePlate}</Text>
              </View>
            }
          </View>
        )

        : (
          <View style={{ width, height, borderRadius, overflow: 'hidden', display: 'flex', backgroundColor: weebleColor, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: initialFontSize, color: 'white' }}>{firstInitial}{lastInitial}</Text>
          </View>
        )
      }
    </Pressable>
  )
}

const getDisplayFrom = (photo: Partial<Photo>): string => {
  let photoUrl = '';

  // prefer a single photo url ??
  if (photo?.display && photo.display.url.length) {
    photoUrl = photo.display.url;
  }

  return photoUrl;
}

const getAlternateImage = (photo: Partial<Photo> = {}, strict: boolean) => strict ? {} : photo

const getDisplayPhotoFrom = (user: StudentModel, shouldUseThenPhoto: boolean, strict = true): string => {
  let photoUrl = '';
  let photo: Partial<Photo>;

  if (shouldUseThenPhoto) {
    photo = user?.thenPhoto || getAlternateImage(user?.nowPhoto, strict);
  } else {
    photo = user?.nowPhoto || getAlternateImage(user?.thenPhoto, strict);
  }

  const photos = user?.photos || [];

  if (photo?.display?.url) {
    photoUrl = getDisplayFrom(photo);
  }

  return photoUrl || photos.filter(p => p.display).map(p => p?.display?.url)[0] || '';
}
