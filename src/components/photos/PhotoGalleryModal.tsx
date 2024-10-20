import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  Modal,
  TouchableHighlight,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  ImageBackground,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import { colors, Header } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../styles/colors';
import * as MediaLibrary from 'expo-media-library';
import CameraRoll, { Album, PhotoIdentifiersPage, PhotoIdentifier } from '@react-native-community/cameraroll';
import { PhotosCarousel } from '../carousels/photos';
import { Photo } from '../../../types/interfaces';
import Icon from 'react-native-vector-icons/Foundation';
import IconFA from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { isAndroid } from '../../helpers/device';
import { uploadFile, PhotoType, CommunityType } from '../../rest/fileUploadService';
import { logEvent } from '../../helpers/analytics';
import RNFetchBlob from 'rn-fetch-blob';
import * as mime from 'react-native-mime-types';
import { manipulateAsync, SaveFormat, Action } from 'expo-image-manipulator';
import { AlbumType } from '../../../data/queries/photos/albums';
import { dataDogStartAction } from '../../helpers/datadog';
import { getImageSize } from '../../helpers/photos';
import { RumActionType } from '@datadog/mobile-react-native';
import { useCurrentUser } from '../../../redux/hooks';

interface Props {
  isVisible: boolean
  shouldShowHeader?: boolean
  albumId?: string | AlbumType.PROFILE_DEFAULT
  photoType?: PhotoType
  communityType?: CommunityType
  communityId?: string
  classId: string
  showProgress?: boolean
  onClose(): void
  onStartUpload?: () => void
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onError: (reason: any) => void
}

enum resizeProperties {
  WIDTH = 'width',
  HEIGHT = 'height'
}

export const PhotoGalleryModal = ({ isVisible, albumId, photoType, communityType, communityId, classId, showProgress = true, onClose, onStartUpload, onSuccess, onError }: Props): JSX.Element => {
  const currentUser = useCurrentUser();
  const firstName = currentUser.firstName.toLowerCase().endsWith('s') ?
    `${currentUser.firstName}'` :
    `${currentUser.firstName}'s`;
  const [ carouselWidth, setCarouselWidth ] = useState(0);
  const [ selectedValue, setSelectedValue ] = useState('gallery');
  const [ loaded, setLoaded ] = useState(false);
  const [ albums, setAlbums ] = useState<Album[]>([]);
  const [ photos, setPhotos ] = useState<PhotoIdentifiersPage>({
    edges: [],
    page_info: {
      has_next_page: false
    }
  });
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [imageUri, setImageUri] = useState<string>();
  const [editorVisible, setEditorVisible] = useState(false);
  const [showModal, setShowModal] = useState(isVisible);
  const [isShown, setIsShown] = useState(false);

  const updateProgressBarState = (data: {
    width: number
    lengthComputable: boolean
  }) => {
    if (showProgress) {
      DeviceEventEmitter.emit('event.PhotoUploadProgress', data)
    }
  }

  const resetProgressBar = () => {
    updateProgressBarState({
      width: 0,
      lengthComputable: false,
    });
  }

  const loadAlbumsPhotos = () => {
    setLoaded(true);
    CameraRoll.getAlbums({
      assetType: 'Photos'
    }).then((res) => setAlbums(res), (reason) => console.warn(reason)).catch(err => console.error(err));
    getPhotos();
  }
  useEffect(() => {
    if (showModal && isShown && !loaded) {
      MediaLibrary.getPermissionsAsync().then(res => {
        if (res.granted) {
          loadAlbumsPhotos();
          return;
        }
        if (!res.canAskAgain && !res.granted) {
          setShowModal(false);
          onClose();
          Alert.alert('Missing permission','You should enable the gallery permission manually!')
        }
        if (res.canAskAgain && !res.granted) {
          MediaLibrary.requestPermissionsAsync().then((res) => {
            if (res.granted) {
              loadAlbumsPhotos();
            } else {
              setShowModal(false);
              onClose();
              Alert.alert('Missing permission','You should enable the gallery permission manually!')
            }
          }, (error) => {
            console.log(error);
          });
        }
      }).catch(err => {
        console.log(err);
      })
    } else {
      if (!showModal) {
        resetProgressBar();
      } else if (loaded) {
        getPhotos();
      }
    }
  }, [loaded, showModal, isShown, selectedValue]);

  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  const getPhotos = () => {
    setLoadingPhotos(true);
    CameraRoll.getPhotos({
      first: 100,
      groupTypes: selectedValue === 'gallery' ? undefined : 'Album',
      groupName: selectedValue === 'gallery' ? undefined : selectedValue,
      assetType: 'Photos',
      include: ['imageSize'],
    }).then((res) => {
      setPhotos(res);
      setLoadingPhotos(false);
    }, (reason) => console.warn(reason)).catch(err => console.error(err))
  }
  const openOther = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1,
    });

    if (!result.cancelled) {
      launchEditor(result.uri)
    }
  }
  const openCamera = async () => {
    dataDogStartAction(RumActionType.TAP, 'open camera button')
    ImagePicker.requestCameraPermissionsAsync().then(async (value) => {
      if (value.granted) {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [1,1],
          quality: 1,
        });

        if (!result.cancelled) {
          launchEditor(result.uri)
        }
      } else {
        Alert.alert('Missing permission','You should enable the camera permission manually!')
      }
    }, (reason) => console.log(reason));
  }

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isCloseToBottom(event.nativeEvent)) {
      paginatePhotos();
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  }

  const paginatePhotos = () => {
    if (photos.page_info.has_next_page) {
      setLoadingPhotos(true);
      CameraRoll.getPhotos({
        first: 100,
        after: photos.page_info.end_cursor,
        groupTypes: selectedValue === 'gallery' ? undefined : 'Album',
        groupName: selectedValue === 'gallery' ? undefined : selectedValue,
        assetType: 'Photos',
        include: ['imageSize']
      }).then((res) => {
        const result: PhotoIdentifiersPage = {
          ...res,
          edges: [
            ...photos.edges,
            ...res.edges
          ]
        };
        setPhotos(result);
        setLoadingPhotos(false);
      }, (reason) => console.warn(reason)).catch(err => console.error(err))
    }
  }

  const launchEditor = async (uri: string) => {
    // StatusBar.setHidden(true);
    // Then set the image uri
    const compressedImage = await compressImage(uri);
    setImageUri(compressedImage.uri);
    setShowModal(false);
    // And set the image editor to be visible
    setEditorVisible(true);
  };

  const compressImage = (uri: string, actions: Action[] = []) => {
    return manipulateAsync(isAndroid() ? uri : uri.replace('file://',''), actions,{
      compress: 0.9,
      format: SaveFormat.JPEG,
    });
  }

  const getFileInfo = (uri: string) => {
    return RNFetchBlob.fs.stat(isAndroid() ? uri : uri.replace('file://',''));
  }

  const getAsset = async (uri: string): Promise<{
    localUri: string
    filename: string
    size: number
  }> => {
    let asset = {
      localUri: '',
      filename: '',
      size: 0
    };
    try {
      if (isAndroid() || uri.startsWith('file://')) {
        const fileInfo = await getFileInfo(uri);
        asset = {
          localUri: uri,
          filename: fileInfo.filename,
          size: fileInfo.size
        };
      } else {
        const iOSAsset = await MediaLibrary.getAssetInfoAsync(uri.replace('ph://',''));
        const fileInfo = await getFileInfo(iOSAsset.localUri || '');
        asset = {
          localUri: iOSAsset.localUri || '',
          filename: fileInfo.filename,
          size: fileInfo.size,
        };
      }

      // Image compression if the image format is High Efficiency Image File Format.
      if (asset.localUri.toLowerCase().endsWith('.heic')) {
        const compressedImage = await compressImage(uri);
        return getAsset(compressedImage.uri);
      }

      // Image compression if the image size (width or height) is bigger than 4000px
      const dimensions = await getImageSize(asset.localUri);
      const maxSize = dimensions.width > dimensions.height ? dimensions.width : dimensions.height;
      if (maxSize > 4000) {
        const resizeProp = dimensions.width > dimensions.height ? resizeProperties.WIDTH : resizeProperties.HEIGHT;
        const compressedImage = await compressImage(uri, [{
          resize: {
            [resizeProp]: 4000
          }
        }]);
        return getAsset(compressedImage.uri);
      }

      // Image compression if the image weight is more than 8MB
      const maxFileSize = 8 * 1024 * 1024; // 8MB
      if (asset.size > maxFileSize) {
        const compressedImage = await compressImage(uri);
        return getAsset(compressedImage.uri);
      }
    } catch (error) {
      console.log('There was an error reading the asset', error)
    }
    return asset;
  }
  const upload = async (uri: string) => {
    onStartUpload ? onStartUpload() : null;
    setShowModal(false);
    const asset = await getAsset(uri);
    try {
      const uploadResponse = await uploadFile({
        uri: asset.localUri,
        fileName: asset.filename,
        mimeType: mime.lookup(asset.filename) || '',
        photoType: (albumId === AlbumType.PROFILE_DEFAULT ? PhotoType.PROFILE_PHOTO : (photoType || PhotoType.PROFILE_PHOTO)),
        onUploadProgress: (progress) => {
          updateProgressBarState({
            width: Math.ceil((progress.loaded / progress.total) * 100),
            lengthComputable: progress.lengthComputable
          });
        },
        albumId: albumId === AlbumType.PROFILE_DEFAULT ? undefined : albumId,
        communityType,
        communityId,
        classId
      })
      if (uploadResponse.data.errors) {
        resetProgressBar();
        onError(uploadResponse.data.errors[0]);
        return;
      }
      logEvent('photo_upload', {
        photoType,
        albumId,
        communityType,
        communityId,
      })
      resetProgressBar();
      onSuccess(uploadResponse.data)
    } catch (error) {
      resetProgressBar();
      onError(error);
    }
  }

  const normalizePhotos = ({ node }: PhotoIdentifier, index: number) => {
    const photo: Partial<Photo> = {
      id: `${node.group_name}-${node.timestamp}-${index}`,
      display: {
        url: node.image.uri,
        width: String(node.image.width),
        height: String(node.image.height)
      }
    };
    return photo as Photo;
  }

  return (
    <View>
      <Modal
        visible={showModal}
        transparent={false}
        presentationStyle='pageSheet'
        onShow={() => setIsShown(true)}
        onDismiss={() => setIsShown(false)}
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          backgroundColor: '#f3f3f3'
        }}
      >
        <SafeAreaView>
          <Header
            backgroundColor='#fff'
            statusBarProps={{
              backgroundColor: Colors.cyan
            }}
            style={{
              height: 40
            }}
            elevated={!!isAndroid()}
            leftComponent={
              {
                icon: 'close',
                onPress: () => onClose(),
                style: {
                  height: 40,
                  width: 40,
                  padding: 10,
                }
              }
            }
            rightComponent={
              isAndroid() ? undefined : ({
                icon: 'list',
                onPress: () => openOther(),
                style: {
                  height: 40,
                  width: 40,
                  padding: 10,
                }
              })
            }
            centerComponent={
              isAndroid() ?
              (<Picker style={styles.pickerStyle}
                selectedValue={selectedValue}
                onValueChange={(itemValue) => {
                  if (itemValue === 'other') {
                    openOther();
                  } else {
                    setSelectedValue(itemValue);
                  }
                }}
                mode={'dropdown'}
              >
                <Picker.Item label="Gallery" value="gallery" />
                {albums.map((album, index) => (
                  <Picker.Item
                    label={album.title}
                    value={album.title}
                    key={index.toString()}
                  />
                ))}
                <Picker.Item label="...Other" value="other" />
              </Picker>) : undefined
            }
          />
          <ScrollView
            style={{ padding: 2 }}
            onScroll={onScroll}
            scrollIndicatorInsets={{ right: 1 }}
          >
            <View onLayout={getPhotoCarouselWidth}
              style={{
                paddingBottom: 50
              }}
            >
              <View
                style={{
                  padding: 10,
                  paddingBottom: 0
                }}
              >
                <TouchableHighlight
                  style={{
                    backgroundColor: Colors.ligthCyan,
                    padding: 20,
                    borderRadius: 70
                  }}
                  underlayColor={Colors.ligthCyan}
                  onPress={() => openCamera()}
                >
                  <View
                    style={{
                      alignItems: 'center'
                    }}
                  >
                    <IconFA
                      name='camera'
                      color={Colors.darkCyan}
                      size={30}
                    />
                    <Text
                      style={{
                        fontSize: 20,
                        color: Colors.darkCyan,
                        fontWeight: 'bold',
                        marginTop: 10,
                        lineHeight: 20
                      }}
                    >TAKE A PHOTO</Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View
                style={{
                  padding: 10
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: Colors.blackRGBA(),
                    fontSize: 24,
                  }}
                >{firstName} Photos (Camera Feed)</Text>
              </View>
              {!!photos.edges.length && <PhotosCarousel
                photos={photos.edges.map(normalizePhotos)}
                width={carouselWidth}
                imageMargin={2}
                staticContent={true}
                rowElements={4}
                multiRow={true}
                onPress={(photoId, index, photo) => {
                  launchEditor(photo.display?.url || '');
                }}
                callToActionIndex={photos.edges.length}
                callToAction={(index, size, margin) => (
                  <TouchableHighlight
                    style={{
                      width: size,
                      height: size,
                      marginBottom: margin,
                      marginRight: margin,
                    }}
                    underlayColor='transparent'
                    onPress={() => openCamera()}
                  >
                    <View
                      style={{
                        width: size,
                        height: size,
                        flex: 1,
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: Colors.ligthCyan,
                        borderColor: colors.grey5,
                        borderWidth: 1,
                      }}
                    >
                      <Icon
                        name='plus'
                        color={Colors.darkCyan}
                        size={45}
                      />
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          textAlign: 'center',
                          color: Colors.darkCyan
                        }}
                      >ADD A PHOTO</Text>
                    </View>
                  </TouchableHighlight>
                )}
                isLoading={loadingPhotos}
                firstItem={0}
              />}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={editorVisible}
        transparent={false}
        presentationStyle='pageSheet'
        onShow={() => setIsShown(true)}
        onDismiss={() => setIsShown(false)}
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexDirection: 'column',
        }}
      >
        <Header
          backgroundColor={Colors.cyan}
          // statusBarProps={{
          //   backgroundColor: Colors.cyan
          // }}
          style={{
            height: 40
          }}
          elevated={!!isAndroid()}
          leftComponent={
            {
              text: 'Cancel',
              onPress: () => onClose(),
              style: {
                padding: 10,
                color: Colors.whiteRGBA(),
                fontWeight: '700',
                backgroundColor: Colors.blackRGBA(0.1),
                borderRadius: 20,
                overflow: 'hidden'
              },
            }
          }
          rightComponent={
            {
              text: 'Done',
              onPress: () => {
                setEditorVisible(false);
                upload(imageUri || '');
              },
              style: {
                padding: 10,
                color: Colors.whiteRGBA(),
                fontWeight: '700',
                backgroundColor: Colors.whiteRGBA(0.1),
                borderRadius: 20,
                overflow: 'hidden'
              }
            }
          }
        />
        <SafeAreaView>
          <ImageBackground
            source={{
              uri: imageUri
            }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'black'
            }}
            resizeMode='contain'
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerStyle:{
    height: 40,
    width: '100%',
    color: '#344953',
    justifyContent: 'flex-start',
    margin: -15,
    padding: 0
  }
});
