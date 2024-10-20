import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as React from 'react'
import { View } from 'react-native'
import { Button } from '../Button'
import { Text } from '../Text'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { openModal, ProfileVisitState } from '../../../redux/slices/profile-visits/slice'
import { globalStyles } from '../../../styles/global-stylesheet'
import { RootStackParamList } from '../../../types/types'
import { PhotoType } from '../../rest/fileUploadService'
import { TabNames } from '../photos/AlbumsAdminModal'
import { LoadingListItem } from './list-item-loading'
import { LoadingSectionHeader } from './loading-section-header'
import { ListSectionHeader } from './section-header'
import { PhotosAlbumsAdminModal } from '../photos'
import { AddPhotoButton } from '../AddPhotoButton'
import { PhotoUploadProgressBar } from '../photos/PhotoUploadProgressBar'

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileVisits'>
}

export const EmptyListItem = ({ navigation }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { profileVisitState } = useAppSelector(state => state.profileVisits)
  const { isLoading, isReloading } = ProfileVisitState
  const shouldShowLoader = [isLoading, isReloading].includes(profileVisitState)
  const [ photosModalVisible, setPhotosModalVisible ] = React.useState(false);
  const [ albumsModalVisible, setAlbumsModalVisible ] = React.useState(false);
  const [ editAlbumId, setEditAlbumId ] = React.useState('');
  const [ isUploadingPhoto, setIsUploadingPhoto ] = React.useState(false);

  if (shouldShowLoader || isUploadingPhoto) {
    return (
      <View style={{ padding: 20 }}>
        <LoadingSectionHeader />
        <LoadingListItem repeats={3} />
      </View>
    )
  }

  return (
    <View style={{
      flex: 1,
      }}
    >
      <ListSectionHeader
        title="Visits"
        count={String(0)}
        showInfoCircle={true}
        onPressInfoCircle={() => dispatch(openModal())}
      />
      <View style={{
        marginLeft: 10,
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        paddingTop: 20,
        backgroundColor: '#fff',
        ...globalStyles.softRadius,
        elevation: 1,
      }}
      >
        <Text style={{
          ...globalStyles.headerText,
          ...globalStyles.darkCyanColor,
          ...globalStyles.centeredText,
          fontSize: 30,
          paddingHorizontal: 45
        }}
        >{'Sorry, you don\'t have any visits to your profile yet'}</Text>
        <Text style={{
          ...globalStyles.normalText,
          ...globalStyles.centeredText,
          fontSize: 19,
          paddingHorizontal: 40
        }}
        >
          <Text style={{
            ...globalStyles.boldText,
            fontSize: 19,
          }}
          >{'Update your profile '}</Text>
          {'to make sure your schoolmates know what you\'re up to!'}
        </Text>
        <AddPhotoButton
          containerStyle={{ ...globalStyles.butonContainerPartialWidth, marginTop: 20 }}
          onPress={() => setAlbumsModalVisible(true)}
        />
        {/** TODO: Include functionality for this button (Add a Story) */}
        <Button
          title="ADD A STORY"
          onPress={() => navigation.navigate('MyProfile', { screen: '_myProfileRoot' })}
          style={{
            marginHorizontal: 20,
            marginVertical: 20,
          }}
          accessibilityLabel="Add a story"
          accessible={true}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('MyProfile', { screen: '_myProfileRoot' })}
        >
          <Text style={{
            ...globalStyles.carouselLinkStyle,
            ...globalStyles.centeredText,
            marginBottom: 40,
            marginTop: 10,
            fontSize: 16
          }}
          >VIEW MY PROFILE</Text>
        </TouchableOpacity>
      </View>
      {
        <PhotosAlbumsAdminModal
          photosModalVisible={photosModalVisible}
          showProgress={false}
          onStartUpload={() => setIsUploadingPhoto(true)}
          onClosePhotos={() => setPhotosModalVisible(false)}
          onSuccessPhotos={() => {
            setIsUploadingPhoto(false);
            setPhotosModalVisible(false);
            navigation.navigate('MyProfile', { screen: '_myProfileRoot' })
          }}
          onErrorPhotos={() => {
            setPhotosModalVisible(false);
          }}
          photoType={PhotoType.PHOTO_ALBUM_TYPE}
          editAlbumId={editAlbumId}
          albumsModalVisible={albumsModalVisible}
          albumsTabIndex={TabNames.PERSON}
          showAlbumTabs={false}
          onCloseAlbums={() => setAlbumsModalVisible(false)}
          onSuccessAlbums={(albumId) => {
            setEditAlbumId(albumId);
            setAlbumsModalVisible(false);
            setPhotosModalVisible(true);
          }}
        />
      }
      <PhotoUploadProgressBar />
    </View>
  )
}
