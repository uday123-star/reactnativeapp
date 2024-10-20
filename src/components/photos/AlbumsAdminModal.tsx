import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  ActivityIndicator,
  ImageBackground,
  ListRenderItemInfo,
  TouchableHighlight,
  LayoutChangeEvent,
} from 'react-native';
// import { Modal } from './Modal';
import {
  TabView,
  TabBar,
  SceneMap,
  NavigationState,
  SceneRendererProps,
} from 'react-native-tab-view';
import { Colors } from '../../../styles/colors';
import { Header } from 'react-native-elements';
import { isAndroid } from '../../helpers/device';
import { AlbumType, GetAlbumsResponse, GetAlbumsVariables, GET_ALBUMS } from '../../../data/queries/photos/albums';
import { useQuery } from '@apollo/client';
import { SwipeListView } from 'react-native-swipe-list-view';
import { AlbumModel, Photo } from '../../../types/interfaces';
import { format, parseISO } from 'date-fns';
import { globalStyles } from '../../../styles/global-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAppSelector, useCurrentUserId } from '../../../redux/hooks';
import store from '../../../redux/store';
import { updateAlbumThunk, addAlbumThunk } from '../../../redux/slices/albums/thunks';
import { getAlbumPhotosThunk } from '../../../redux/slices/photos/thunks';
import { AlbumsState } from '../../../redux/slices/albums/slice';
import { UpdateAlbumsResponse, AddAlbumsResponse } from '../../../data/queries/photos/albums';
import { GetPhotosAlbumsResponse, PhotosVisibleState, PrivacyLevels } from '../../../data/queries/photos/photos';
import { PhotosCarousel } from '../carousels/photos';
import { NewAlbumForm } from './NewAlbumForm';

export enum TabNames {
  PERSON = 0,
  SCHOOL = 1,
  REUNION = 2
}
interface Props {
  isVisible: boolean
  schoolId?: string
  classId?: string
  tabIndex?: TabNames
  showTabs?: boolean
  onClose: () => void
  onSuccess?: (albumId: string) => void
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onError?: (reason: any) => void
}

type State = NavigationState<{
  key: string
  title: string
}>;

interface EditState {
  [id:string]: boolean
}
const albumData: {
  [id: string]: {
    title?: string
    description?: string
    photo?: string
  }
} = {};

export const AlbumsAdminModal = ({ isVisible, schoolId, tabIndex, showTabs = true, onClose, onSuccess }: Props): JSX.Element => {
  const albumState = useAppSelector(state => state.albumsSlice.albumState);
  const currentUserId = useCurrentUserId();
  const [isUpdating, setIsUpdating] = useState(albumState === AlbumsState.isLoading);
  const [ carouselWidth, setCarouselWidth] = useState(0);
  const [ editPhotos, setEditPhotos] = useState<Photo[]>();
  const [ newAlbumForm, setNewAlbumForm] = useState({
    person: false,
    school: false,
    reunion: false
  });

  const CurrentUserDefaultVariables: GetAlbumsVariables = {
    currentUser: true,
    filters: {
      albumTypes: [AlbumType.PROFILE_DEFAULT]
    }
  }
  const { data: CurrentUserDefaultData, loading: CurrentUserDefaultLoading } = useQuery<GetAlbumsResponse>(GET_ALBUMS, {
    variables: CurrentUserDefaultVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const CurrentUserVariables: GetAlbumsVariables = {
    currentUser: true,
    filters: {
      albumTypes: [AlbumType.PERSONAL_ALBUM]
    }
  }
  const { data: CurrentUserData, loading: CurrentUserLoading, refetch: refetchCurrentUser } = useQuery<GetAlbumsResponse>(GET_ALBUMS, {
    variables: CurrentUserVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const SchoolVariables: GetAlbumsVariables = {
    schoolId,
    filters: {
      albumTypes: [AlbumType.COMMUNITY_ALBUM],
      visibleStates: [PhotosVisibleState.VISIBLE],
      privacyLevels: [PrivacyLevels.PUBLIC]
    }
  }
  const { data: SchoolData, loading: SchoolLoading, refetch: refetchSchool } = schoolId ? useQuery<GetAlbumsResponse>(GET_ALBUMS, {
    variables: SchoolVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  }) : { data: null, loading: false, refetch: null };

  const [editStates, setEditStates] = useState<EditState>({});

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => (
    showTabs && <TabBar
      {...props}
      // scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabbar}
      labelStyle={styles.label}
    />
  ) || null;

  const canHaveActions = (album: AlbumModel) => {
    for (const key in editStates) {
      if (editStates[key]) {
        return false;
      }
    }
    if (album.type === 'PROFILE_DEFAULT') {
      return false;
    } else {
      if (String(album.createdBy) !== currentUserId) {
        return false;
      }
    }
    return true;
  }

  const canGetOption = () => {
    for (const key in editStates) {
      if (editStates[key]) {
        return false;
      }
    }
    return true;
  }

  const getAlbumName = (album: AlbumModel) => {
    let name = album.name;
    switch (album.type) {
      case 'PROFILE_DEFAULT':
        name = 'Your Photos';
        break;
    }
    return name;
  }

  const updateAlbum = (albumId: string) => {
    if (albumData[albumId]) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      store.dispatch<any>(updateAlbumThunk({
        entityId: albumId,
        name: albumData[albumId].title,
        description: albumData[albumId].description,
        coverPhoto: albumData[albumId].photo
      })).unwrap().then((response: UpdateAlbumsResponse) => {
        const updatedAlbum = response.updateAlbum.id;
        console.log(`album updated ${updatedAlbum}`)
        setIsUpdating(false);
        setEditPhotos(undefined);
        refetchCurrentUser();
        refetchSchool && refetchSchool();
      })
    }
    delete albumData[albumId];
    setEditStates({
      ...editStates,
      [albumId]: false,
    });
  }

  const getPhotoCarouselWidth = (event: LayoutChangeEvent) => {
    const {
      width
    } = event.nativeEvent.layout;
    setCarouselWidth(width);
  }

  const getPhotos = (albumId: string) => {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    store.dispatch<any>(getAlbumPhotosThunk({
      albumId,
      filters: {
        albumTypes: [AlbumType.ALL],
        visibleStates: [PhotosVisibleState.VISIBLE]
      }
    })).unwrap().then((response: GetPhotosAlbumsResponse) => {
      setEditPhotos(response.photos.photos);
    })
  }

  const renderItem = (data: ListRenderItemInfo<AlbumModel>) => (
    <TouchableHighlight
      onPress={() => {
        if (!canGetOption()) {
          return;
        }
        onSuccess && onSuccess(data.item.id);
      }}
      style={{
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        backgroundColor: '#f9f9f9',
      }}
      underlayColor='transparent'
    >
      <View>
        <View
          style={styles.itemContainer}
        >
          <View
            style={styles.coverContainer}
          >
            <View style={{
              flex: 1,
              ...styles.coverStyle,
              overflow: 'hidden',
              borderColor: '#000',
              borderWidth: 2,
            }}
            >
              <ImageBackground source={data.item.coverPhoto?.thumbnail?.url ? {
                  uri: data.item.coverPhoto?.thumbnail?.url
                } : require('../../../assets/images/photos/image-default-black.png')}
                style={[styles.coverStyle,{
                  marginTop: -2,
                  marginLeft: -2
                }]}
                resizeMode='cover'
                resizeMethod='resize'
              />
            </View>
            {
              editStates[data.item.id] && <View
                style={{
                  position: 'absolute',
                  backgroundColor: Colors.blackRGBA(0.4),
                  top: 10,
                  left: 10,
                  borderRadius: 20,
                  flex: 1,
                  flexBasis: 40,
                  height: 40,
                  width: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <Icon.Button name="plus"
                  size={15}
                  color={'#fff'}
                  backgroundColor={'transparent'}
                  underlayColor={'transparent'}
                  borderRadius={0}
                  iconStyle={{
                    textAlign: 'center',
                    width: '100%',
                    lineHeight: 15,
                  }}
                  onPress={() => getPhotos(data.item.id)}
                />
              </View>
            }
          </View>
          <View
            style={styles.textsContainer}
          >
            {
              !editStates[data.item.id] && <Text
                style={[globalStyles.boldText,{
                  color: Colors.darkCyan,
                  fontSize: 20
                }]}
              >{getAlbumName(data.item)}</Text>
            }
            {
              editStates[data.item.id] && <TextInput
                style={[globalStyles.boldText, {
                  borderBottomColor: Colors.ligthCyan,
                  borderBottomWidth: 1,
                  width: '75%',
                  padding: 0,
                  color: Colors.darkCyan,
                  fontSize: 20
                }]}
                defaultValue={data.item.name}
                onChangeText={(e) => {
                  albumData[data.item.id] = {
                    ...(albumData[data.item.id] || {}),
                    title: e,
                  };
                }}
              />
            }
            <Text
              style={[
                globalStyles.linkColor,
                globalStyles.boldText,
                {
                  fontSize: 16,
                  color: Colors.blackRGBA()
                }
              ]}
            >{format(parseISO(data.item.creationDate), 'MMM do yyyy')}</Text>
            {
              !editStates[data.item.id] && <Text
                style={[globalStyles.normalText,{
                  color: Colors.blackRGBA(),
                  fontSize: 16,
                  marginTop: 5
                }]}
              >{data.item.description}</Text>
            }
            {
              editStates[data.item.id] && <TextInput
                style={[globalStyles.normalText, {
                  borderBottomColor: Colors.ligthCyan,
                  borderBottomWidth: 1,
                  width: '75%',
                  padding: 0,
                  color: Colors.blackRGBA(),
                  fontSize: 16,
                  marginTop: 5
                }]}
                placeholder='Description'
                defaultValue={data.item.description}
                onChangeText={(e) => {
                  albumData[data.item.id] = {
                    ...(albumData[data.item.id] || {}),
                    description: e,
                  };
                }}
              />
            }
          </View>
          {
            editStates[data.item.id] && <View
              style={styles.acceptActionsContainer}
            >
              <View
                style={[styles.iconContainer, styles.iconsAcceptActions, styles.smallIcons]}
              >
                <Icon.Button name="check"
                  size={15}
                  color={'#fff'}
                  backgroundColor={Colors.green}
                  underlayColor={'transparent'}
                  borderRadius={0}
                  iconStyle={styles.iconTextStyle}
                  style={{
                    ...styles.iconStyle,
                    ...styles.smallIcons,
                  }}
                  onPress={() => updateAlbum(data.item.id)}
                />
              </View>
              <View
                style={[styles.iconContainer, styles.iconsAcceptActions, styles.smallIcons]}
              >
                <Icon.Button name="close"
                  size={15}
                  color={'#fff'}
                  backgroundColor={Colors.red}
                  underlayColor={'transparent'}
                  borderRadius={0}
                  iconStyle={styles.iconTextStyle}
                  style={{
                    ...styles.iconStyle,
                    ...styles.smallIcons
                  }}
                  onPress={() => {
                    setEditStates({
                      ...editStates,
                      [data.item.id]: false,
                    });
                    setEditPhotos(undefined);
                  }}
                />
              </View>
            </View>
          }
        </View>
        {
          (editStates[data.item.id] && editPhotos) && <View style={{ flex: 1, marginLeft: 0, marginTop: 10, marginBottom: 10 }} onLayout={getPhotoCarouselWidth}>
            <PhotosCarousel
              photos={editPhotos}
              width={carouselWidth}
              onPress={(photoId) => {
                albumData[data.item.id] = {
                  ...(albumData[data.item.id] || {}),
                  photo: photoId
                };
                setEditPhotos(undefined);
              }}
              firstItem={0}
            />
          </View>
        }
      </View>
    </TouchableHighlight>
  );

  const getAddAlbumButton = (type: string) => (<View
    style={styles.floatingButton}
  >
    <TouchableHighlight
      style={styles.floatingButtonContent}
      underlayColor={Colors.ligthCyan}
      onPress={() => {
        if (type === 'PERSON') {
          setNewAlbumForm({
            person: true,
            school: false,
            reunion: false,
          })
        }
        if (type === 'SCHOOL') {
          setNewAlbumForm({
            person: false,
            school: true,
            reunion: false,
          })
        }
        if (type === 'REUNION') {
          setNewAlbumForm({
            person: false,
            school: false,
            reunion: true,
          })
        }
      }}
    >
      <Text
        style={styles.floatingButtonText}
      >CREATE NEW PHOTO ALBUM</Text>
    </TouchableHighlight>
  </View>)

  const renderHiddenItem = (data: ListRenderItemInfo<AlbumModel>) => (
    (canHaveActions(data.item) && <View
      style={styles.actionButtonsContainer}
    >
      <View
        style={styles.actionButtons}
      >
        <View
          style={styles.iconContainer}
        >
          <Icon.Button name="pencil"
            size={20}
            color={'#fff'}
            backgroundColor={Colors.cyan}
            underlayColor={'transparent'}
            borderRadius={0}
            iconStyle={styles.iconTextStyle}
            style={styles.iconStyle}
            onPress={() => setEditStates({ ...editStates,[data.item.id]: true })}
          />
        </View>
        <View
          style={styles.iconContainer}
        >
          <Icon.Button name="trash-o"
            size={20}
            color={'#fff'}
            backgroundColor={Colors.darkCyan}
            underlayColor={'transparent'}
            borderRadius={0}
            iconStyle={styles.iconTextStyle}
            style={styles.iconStyle}
            onPress={() => console.log(`Delete ${data.item.id}`)}
            disabled={true}
          />
        </View>
      </View>
    </View>) || null
  )

  const saveAlbum = (type: string, data: {
    title: string
    description: string
  }) => {
    setNewAlbumForm({
      person: false,
      school: false,
      reunion: false
    });
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    store.dispatch<any>(addAlbumThunk({
      entityId: type === 'SCHOOL' ? schoolId : undefined,
      type,
      ...data,
    })).unwrap().then((response: AddAlbumsResponse) => {
      const savedAlbum = response.addAlbum.id;
      console.log(`album saved ${savedAlbum}`)
      if (type === 'PERSON')
        refetchCurrentUser();
      if (type === 'SCHOOL')
        refetchSchool && refetchSchool();
    })
  }

  const defaultAlbum: Partial<AlbumModel> = {
    id: AlbumType.PROFILE_DEFAULT,
    type: AlbumType.PROFILE_DEFAULT,
    creationDate: new Date().toISOString()
  }
  const personAlbums = () => (<View style={styles.albumsContainer}>
    {
      (CurrentUserLoading || isUpdating) && <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          color={Colors.cyan}
          style={styles.loadingStyle}
        />
      </View>
    }
    {
      (
        (!CurrentUserDefaultLoading && CurrentUserDefaultData) &&
        (!CurrentUserLoading && CurrentUserData) &&
        !isUpdating
      ) && <SwipeListView
        data={[
          ...(
            CurrentUserDefaultData.albums.albums.length ?
            CurrentUserDefaultData.albums.albums :
            [defaultAlbum]
          ),
          ...CurrentUserData.albums.albums
        ]}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-120}
      />
    }
    {
      getAddAlbumButton('PERSON')
    }
    {
      newAlbumForm.person && <NewAlbumForm
        onSuccess={(data) => saveAlbum('PERSON', data)}
        onCancel={() => setNewAlbumForm({
          person: false,
          school: false,
          reunion: false
        })}
      />
    }
  </View>);
  const schoolAlbums = () => (<View style={styles.albumsContainer}>
    {
      (SchoolLoading || isUpdating) && <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          color={Colors.cyan}
          style={styles.loadingStyle}
        />
      </View>
    }
    {
      (!SchoolLoading && !isUpdating && SchoolData) && <SwipeListView
        data={SchoolData.albums.albums}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-120}
      />
    }
    {
      getAddAlbumButton('SCHOOL')
    }
    {
      newAlbumForm.school && <NewAlbumForm
        onSuccess={(data) => saveAlbum('SCHOOL', data)}
        onCancel={() => setNewAlbumForm({
          person: false,
          school: false,
          reunion: false
        })}
      />
    }
  </View>);

  const renderScene = SceneMap({
    person: personAlbums,
    school: schoolAlbums,
    // reunion: createMyElement, // TODO: Include reunion albums for uploading photos
  });

  const [index, setIndex] = useState(tabIndex ? tabIndex : 0);
  const [ routes ] = useState([
    { key: 'person', title: 'My Albums' },
    { key: 'school', title: 'School' }
  ])

  return (
    <Modal
      visible={isVisible}
      animationType='slide'
      presentationStyle='pageSheet'
    >
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
        centerComponent={
          (<Text
            style={{
              fontWeight: '900',
              fontSize: 16,
              marginTop: 13
            }}
          >Albums</Text>)
        }
      />
      <TabView
        navigationState={{
          index,
          routes
        }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: 100, height: 100 }}
        swipeEnabled={false}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: Colors.cyan,
  },
  indicator: {
    backgroundColor: Colors.ligthCyan,
  },
  label: {
    fontWeight: '400',
    textTransform: 'capitalize'
  },
  iconTextStyle: {
    width: 'auto',
    height: 'auto',
    minWidth: '100%',
    margin: 0,
    textAlign: 'center'
  },
  iconStyle: {
    width: 60,
    height: 60,
    padding: 0
  },
  iconContainer: {
    flex: 1,
    flexBasis: 60,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flex: 1,
    width: 120,
    flexDirection: 'row'
  },
  actionButtonsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    paddingVertical: 10,
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    position: 'relative'
  },
  coverContainer: {
    height: 60,
    width: 60,
    padding: 10,
    position: 'relative'
  },
  coverStyle: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 20,
  },
  textsContainer: {
    flex: 1,
    height: 60,
    padding: 10,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  loadingStyle: {
    width: 40,
    height: 40
  },
  albumsContainer: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    position: 'relative'
  },
  iconsAcceptActions: {
    flexBasis: 30,
    flexWrap: 'wrap',
    borderRadius: 30,
    overflow: 'hidden',
    marginLeft: 5
  },
  smallIcons: {
    width: 30,
    height: 30,
  },
  acceptActionsContainer: {
    position: 'absolute',
    width: 70,
    height: 30,
    bottom: 5,
    right: 5,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignContent: 'flex-end'
  },
  floatingButton: {
    position: 'absolute',
    left: 0,
    bottom: 80,
    height: 50,
    width: '100%',
    paddingHorizontal: 30
  },
  floatingButtonContent: {
    backgroundColor: Colors.cyan,
    borderRadius: 25,
    overflow: 'hidden',
    flex: 1,
    flexBasis: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonText: {
    color: Colors.whiteRGBA(),
    fontWeight: 'bold',
    fontSize: 18
  }
});
