import { ScreenWidth } from '@freakycoder/react-native-helpers';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { StudentModel } from '../../../../types/interfaces';
import { Content } from './Content';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClasslistStackParamList } from '../../../../types/types';
import { VisiteesByOrigin } from '../../../hooks/useVisiteeIdByOrigin';
import { useRoute } from '@react-navigation/native';

type parentProps = NativeStackScreenProps<ClasslistStackParamList, '_carousel'>
interface Props extends Partial<parentProps> {
  sortedStudents: StudentModel[]
  firstItem: number
  studentId: string
}

export const ProfileCarousel = ({ sortedStudents, firstItem, navigation }: Props): JSX.Element => {
  const route = useRoute()
  const _carousel = useRef<Carousel<StudentModel>>();

  const [ activeIndex, setActiveIndex ] = useState(firstItem)

  const _snapToItem = (slideIndex: number): void => {
    setActiveIndex(slideIndex);
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:profile:people`]: sortedStudents[slideIndex].personId || ''
    })
  }

  const carousel = _carousel.current as Carousel<StudentModel>;
  const _renderItem = ({ item, index }: { item: StudentModel; index: number }): JSX.Element => {
    return (
      <View
        style={{
          width: ScreenWidth,
          height: '100%',
          padding: 10
        }}
      >
        <Content student={item}
          length={!!(carousel) && carousel.props.data.length}
          index={index}
          navigateBack={() => carousel && carousel?.snapToPrev()}
          navigateForward={() => carousel && carousel?.snapToNext()}
          navigation={navigation}
          basicInfoOnly={!(index === activeIndex)}
        />
      </View>
    )
  }

  // These links were necessary for understanding, and implementing FlashList / carousel
  // functionality. Getting the first item to display was buggy, mysterious and challenging.
  // Change at your own peril !!
  // @see https://dev.to/lloyds-digital/let-s-create-a-carousel-in-react-native-4ae2
  // @see https://github.com/meliorence/react-native-snap-carousel
  // @see https://github.com/meliorence/react-native-snap-carousel/issues/538
  return (
    <View style={{
      width: ScreenWidth,
      height: '100%',
    }}
    >
      <Carousel
        ref={(c: Carousel<StudentModel>) => _carousel.current = c}
        layout={'default'}
        data={sortedStudents}
        sliderWidth={ScreenWidth}
        itemWidth={ScreenWidth}
        renderItem={_renderItem}
        firstItem={firstItem}
        initialScrollIndex={firstItem}
        getItemLayout={(_, index) => {
          return {
            index,
            length: ScreenWidth,
            offset: ScreenWidth * index
          }
        }}
        initialNumToRender={0}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        windowSize={2}
        onEndReachedThreshold={10}
        /**
         * Pagination had to be removed due to the sorting changes for featured carousel
         * we need to implement a different way to paginate the results.
         */
        // onEndReached={() => {
        //   if (hasMoreStudentsOnServer) {
        //     // load more
        //     dispatch(loadNextPageOfStudents());
        //   }
        // }}
        onSnapToItem={_snapToItem}
        onLayout={() => {
          VisiteesByOrigin({
            ...VisiteesByOrigin(),
            [`${route.name}:profile:people`]: sortedStudents[activeIndex].personId || ''
          })
        }}
        style={{
          width: ScreenWidth,
          height: '100%',
        }}
        slideStyle={{
          width: ScreenWidth,
          height: '100%',
        }}
      />
    </View>
  )
}
