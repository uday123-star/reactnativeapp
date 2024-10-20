import { ScreenWidth } from '@freakycoder/react-native-helpers';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Photo } from '../../../../types/interfaces';
import { CallToAction, Content } from './Content';
import MasonryList from '@react-native-seoul/masonry-list';
import { colors, Image, } from 'react-native-elements';
import { TouchableHighlight } from 'react-native-gesture-handler';
// import { isNull } from 'lodash';
import { Colors } from '../../../../styles/colors';
import { ContentFullScreen } from './ContentFullScreen';
import isNull from 'lodash/isNull';
import { ReportedEntityType } from '../../../../data/queries/security/report';
import { getImageSize } from '../../../helpers/photos';
import { ReportContentModal } from '../../reports/ReportContentModal';
import { VisiteesByOrigin } from '../../../hooks/useVisiteeIdByOrigin';
import { useRoute } from '@react-navigation/native';
interface Props {
  photos: Photo[]
  /**Width of the container, required for calculating the size of the elements, the screen width is the default value*/
  width: number
  /**If fullScreen is set to true, we will display one image at a time along the publisher information, based on the Photos Carousel Screen design */
  fullScreen?: boolean
  /**If staticContent is set to true, PhotosCarouse will not return a Carousel, it will return a grid. Default to false*/
  staticContent?: boolean
  /**The first element we will show on a carousel [0-(photos.length - 1)] */
  firstItem: number
  /**Number of elements per row, Default to 2 */
  rowElements?: number
  /**If true the carousel will return multiple rows, not only one. Default to false */
  multiRow?: boolean
  /**Total amount of elements, requires multiRow: true */
  maxElements?: number
  /**Margin between elements, Default to 10 */
  imageMargin?: number
  /**Array of photos Ids to be ignored, default to [] */
  excludeIds?: string[]
  /**If set to true, will return a masonry list, not a grid, requires staticContent: true. Default to false */
  masonryList?: boolean
  /**Additional element to be added in the list */
  callToAction?: (index: number, size?: number, margin?: number) => JSX.Element
  /**The index of the list where the callToAction should be placed */
  callToActionIndex?: number | null
  /**Used only when staticContent: false, returns the element when scrolling between the items in the carousel */
  snapToItem?: (photoId: string, index: number) => void
  /**Detects the onPress Event for each element in the list */
  onPress?: (photoId: string, index: number, photo: Photo) => void
  /**Add a loading animation at the end of the list when true */
  isLoading?: boolean
}

export const PhotosCarousel = ({
  photos,
  width = ScreenWidth,
  fullScreen = false,
  staticContent = false,
  firstItem,
  rowElements = 2,
  multiRow = false,
  maxElements,
  imageMargin = 10,
  excludeIds = [],
  masonryList = false,
  callToAction,
  callToActionIndex = null,
  snapToItem,
  onPress,
  isLoading = false,
}: Props): JSX.Element | null => {
  const route = useRoute();
  const thumbnailSize = width / 3.5;

  const [ rendereablePhotos, setRendereablePhotos ] = useState<(Photo|CallToAction)[]>([]);
  const [ renderState, setRenderState ] = useState({
    firstLoad: false,
    displayConfig: false,
    callToAction: false
  })

  const firstItemPosition = useMemo(() => {
    if (firstItem > 0) {
      return firstItem;  
    }
    return 0;
  }, [firstItem]);

  const setPhotosData = (records: (Photo|CallToAction)[]) => {
    const promises = records.map((photo) => {
      if ('callToAction' in photo) {
        return photo;
      }
      const { display } = photo;
      if (Number(display?.height) === 0 || Number(display?.width) === 0) {
        return getImageSize(display?.url || '').then((size): Photo => ({
          ...photo,
          display: {
            url: display?.url || '',
            width: String(size.width),
            height: String(size.height)
          }
        }));
      }
      return photo;
    });
    Promise.all(promises).then((result) => {
      setRendereablePhotos(result);
      const {
        firstLoad,
        displayConfig,
        callToAction,
      } = renderState;
      if (!firstLoad && !displayConfig && !callToAction) {
        setRenderState({
          ...renderState,
          firstLoad: true,
        });
      } else if (firstLoad && !displayConfig && !callToAction) {
        setRenderState({
          ...renderState,
          displayConfig: true,
        });
      } else if (firstLoad && displayConfig && !callToAction) {
        setRenderState({
          ...renderState,
          callToAction: true
        });
      }
    });
  }

  useEffect(() => {
    setPhotosData([...photos].filter(photo => !excludeIds.includes(photo.id)));
  }, []);

  useEffect(() => {
    const {
      firstLoad,
      displayConfig,
      callToAction: callToActionState,
    } = renderState;
    if (firstLoad && !displayConfig && !callToActionState) {
      if ((staticContent && !multiRow) || (staticContent && multiRow && maxElements)) {
        const tmpPhotos = [...rendereablePhotos];
        tmpPhotos.splice((rowElements - (callToAction ? 1 : 0)), rendereablePhotos.length);
        setPhotosData(tmpPhotos);
      }
    } else if (firstLoad && displayConfig && !callToActionState) {
      if (callToAction) {
        if (isNull(callToActionIndex)) {
          setPhotosData([
            ...rendereablePhotos,
            {
              id: 'call_to_action',
              callToAction
            }
          ])
        } else {
          const items = [...rendereablePhotos];
          setPhotosData([
            ...items.slice(0, callToActionIndex),
            {
              id: 'call_to_action',
              callToAction
            },
            ...items.slice(callToActionIndex)
          ]);
        }
      }
    }
  }, [renderState])

  const [ isReportModalVisible, setIsReportModalVisible ] = useState(false);
  const [ photoToReport, setPhotoToReport ] = useState<Photo>();
  const _carousel = useRef<Carousel<Photo>>();

  const _renderItem = ({ item, index }: { item: Photo; index: number }): JSX.Element => {
    return (<Content
      photo={item}
      size={thumbnailSize}
      index={index}
      onPress={onPress}
    />)
  }

  const _snapToItem = (slideIndex: number): void => {
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:photo_carousel:photos`]: photos[slideIndex].createdBy
    })
  }

  const _renderItemFullScreen = ({ item, index }: { item: Photo; index: number }): JSX.Element => {
    const carousel = _carousel.current as Carousel<Photo>;
    return (<ContentFullScreen
      photo={item}
      size={width}
      index={index}
      length={rendereablePhotos.length}
      onPress={onPress}
      navigateBack={() => carousel && carousel?.snapToPrev()}
      navigateForward={() => carousel && carousel?.snapToNext()}
      onReport={(photo) => {
        setIsReportModalVisible(true);
        setPhotoToReport(photo);
      }}
    />)
  }

  if (!width) {
    return (
      <View></View>
    )
  }

  if (fullScreen || !staticContent) {
    // These links were necessary for understanding, and implementing FlashList / carousel
    // functionality. Getting the first item to display was buggy, mysterious and challenging.
    // Change at your own peril !!
    // @see https://dev.to/lloyds-digital/let-s-create-a-carousel-in-react-native-4ae2
    // @see https://github.com/meliorence/react-native-snap-carousel
    // @see https://github.com/meliorence/react-native-snap-carousel/issues/538
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', width }}>
        {!!(rendereablePhotos.length) && <Carousel
          ref={(c: Carousel<Photo>) => _carousel.current = c}
          layout='default'
          data={rendereablePhotos as Photo[]}
          sliderWidth={width}
          itemWidth={fullScreen ? width : thumbnailSize}
          renderItem={fullScreen ? _renderItemFullScreen : _renderItem}
          firstItem={firstItemPosition}
          initialScrollIndex={firstItemPosition}
          getItemLayout={(data, index) => (
            { length: width, offset: width * index, index }
          )}
          loop={!fullScreen}
          activeSlideAlignment='center'
          onSnapToItem={(index) => {
            if (snapToItem) {
              snapToItem(rendereablePhotos[index].id, index)
            }
            if (fullScreen) {
              _snapToItem(index);
            }
          }}
          onLayout={() => {
            if (fullScreen) {
              VisiteesByOrigin({
                ...VisiteesByOrigin(),
                [`${route.name}:photo_carousel:photos`]: (rendereablePhotos[firstItemPosition] as Photo).createdBy
              })
            }
          }}
        />}
        {Boolean(isReportModalVisible) && <ReportContentModal
          type={ReportedEntityType.PHOTO}
          entityId={photoToReport?.id || ''}
          url={photoToReport?.display?.url || ''}
          onClose={() => setIsReportModalVisible(false)}
        />}
      </View>
    )
  }

  const imageSize = ((width - ((rowElements - 1) * imageMargin)) / rowElements);
  if (masonryList) {
    return (
      <MasonryList
        data={rendereablePhotos}
        numColumns={rowElements}
        style={{
          width
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, i }: {
          item: Photo|CallToAction
          i: number
        }) => {
          if (('callToAction' in item)) {
            return item.callToAction(i, imageSize, imageMargin)
          }

          let height = 0;
          if (item.display?.width && item.display?.height) {
            height = (imageSize / Number(item.display?.width)) * Number(item.display?.height);
          }
          return (
            <TouchableHighlight
              onPress={() => onPress ? onPress(item.id, i, item) : null}
              style={{
                marginBottom: imageMargin,
                width: imageSize,
              }}
            >
              <Image
                source={{ uri: item.display?.url || '' }}
                accessibilityLabel='Image'
                accessibilityRole='image'
                style={{
                  width: imageSize,
                  height,
                  borderColor: colors.grey5,
                  borderWidth: 1,
                  borderRadius: 5
                }}
                height={height}
                width={imageSize}
              />
            </TouchableHighlight>
          )
        }}
        keyExtractor={(item, index): string => `${item.id}-${index}`}
        // refreshing={isLoadingNext}
        // onRefresh={() => refetch({first: ITEM_CNT})}
        // onEndReachedThreshold={0.1}
        // onEndReached={() => loadNext(ITEM_CNT)}
      />
    )
  }
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        flexBasis: 'auto',
        flexWrap: 'wrap',
        flexGrow: imageMargin,
        alignContent: 'space-around',
        justifyContent: 'flex-start',
        width: width + imageMargin,
      }}
    >
      {rendereablePhotos.map((photo, index) => (
        <Content
          key={`${photo.id}-${index}}`}
          photo={photo}
          size={imageSize}
          index={index}
          margin={imageMargin}
          onPress={onPress}
        />
      ))}
      {
        Boolean(isLoading) && <ActivityIndicator
          color={Colors.cyan}
          style={{
            backgroundColor: Colors.ligthCyan,
            width: imageSize,
            height: imageSize
          }}
        />
      }
    </View>
  )
}
