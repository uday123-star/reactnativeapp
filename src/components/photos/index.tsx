import React from 'react';
import { View } from 'react-native';
import { PhotoType } from '../../rest/fileUploadService'
import { AlbumsAdminModal, TabNames } from './AlbumsAdminModal'
import { PhotoGalleryModal } from './PhotoGalleryModal'
import { AffiliationModel } from '../../../types/interfaces';
import BasicAlert from '../BasicAlert';

interface Props {
  photosModalVisible: boolean
  onClosePhotos: () => void
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onSuccessPhotos: (data: any) => void
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onErrorPhotos: (reason: any) => void
  photoType: PhotoType
  editAlbumId: string
  classId?: string
  showProgress?: boolean
  onStartUpload?: () => void
  albumsModalVisible: boolean
  currentAffiliation?: AffiliationModel
  onCloseAlbums: () => void
  onSuccessAlbums: (albumId: string) => void
  albumsTabIndex?: TabNames
  showAlbumTabs?: boolean
}
export const PhotosAlbumsAdminModal = ({
  photosModalVisible,
  onClosePhotos,
  onSuccessPhotos,
  onErrorPhotos,
  photoType,
  editAlbumId,
  classId,
  showProgress,
  onStartUpload,
  currentAffiliation,
  albumsModalVisible,
  onCloseAlbums,
  onSuccessAlbums,
  albumsTabIndex,
  showAlbumTabs
}: Props): JSX.Element => {

  return (<View>
    {
      photosModalVisible && <PhotoGalleryModal
        isVisible={photosModalVisible}
        onClose={onClosePhotos}
        onSuccess={(data) => {
          BasicAlert.show({
            title: 'Photos',
            text: 'Your photo was successfully uploaded!',
          });
          onSuccessPhotos(data);
        }}
        onError={(error) => {
          BasicAlert.show({
            title: 'Photos',
            text: 'Oops!! There was an error uploading your photo, try again later.',
          });
          console.log(JSON.stringify(error));
          onErrorPhotos(error);
        }}
        photoType={photoType}
        albumId={editAlbumId}
        showProgress={showProgress}
        onStartUpload={onStartUpload}
        classId={classId || ''}
      />
    }
    {
      albumsModalVisible && <AlbumsAdminModal
        isVisible={albumsModalVisible}
        schoolId={currentAffiliation?.schoolId}
        classId={currentAffiliation?.classId}
        onClose={onCloseAlbums}
        onSuccess={onSuccessAlbums}
        tabIndex={albumsTabIndex}
        showTabs={showAlbumTabs}
      />
    }
  </View>);
}
