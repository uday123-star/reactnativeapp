import React from 'react';
import { ScreenWidth } from '@freakycoder/react-native-helpers';
import Carousel from 'react-native-snap-carousel';
import { AffiliationModel, StudentModel } from '../../../../types/interfaces';
import { Content } from './Content';
import { View, Text } from 'react-native';
import { CarouselState } from '../../../../redux/slices/feature-carousel/slice';
import { FeaturedCarouselInvite } from './Invite';
import { LoadingContent } from './Loading';
import { FeaturedCarouselError } from './ErrorState';
import { VisiteesByOrigin } from '../../../hooks/useVisiteeIdByOrigin';
import { useRoute } from '@react-navigation/native';

type NavigateToCarousel = ({ student, currentAffiliation }: { student: StudentModel; currentAffiliation: AffiliationModel}) => void

interface Props {
  currentAffiliation: AffiliationModel
  navigateToCarousel: NavigateToCarousel
  items: StudentModel[]
  carouselState: CarouselState
}

export const FeaturedCarousel = ({ currentAffiliation, items, carouselState, navigateToCarousel }: Props): JSX.Element => {
  const route = useRoute();
  const _snapToItem = (slideIndex: number): void => {
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:carousel:home`]: items[slideIndex].personId
    })
  }

  const _renderItem = ({ item }: {
    item: StudentModel
    index: number
  }): JSX.Element => {
    return (
      <Content
        currentAffiliation={currentAffiliation}
        student={item}
        navigateToCarousel={navigateToCarousel}
        contentCardContainerStyles={{ marginRight: 0 }}
        accessibilityLabelContentAreaClick={'Featured Member Profile'}
        carouselState={carouselState}
      />
   )
  }

  const getCarousel = () => {
    return (
      <Carousel
        layout={'default'}
        data={items}
        renderItem={_renderItem}
        onSnapToItem={_snapToItem}
        activeSlideAlignment={'start'}
        sliderWidth={ScreenWidth}
        itemWidth={ScreenWidth - 40}
        firstItem={0}
        initialScrollIndex={0}
        inactiveSlideScale={1}
        ListEmptyComponent={<View><Text>Invite more people</Text></View>}
        getItemLayout={(_, index) => {
          return {
            index,
            length: ScreenWidth,
            offset: ScreenWidth * index
          }
        }}
        onLayout={() => {
          VisiteesByOrigin({
            ...VisiteesByOrigin(),
            [`${route.name}:carousel:home`]: items[0].personId
          })
        }}
      />
    )
  }

  const {
    IsLoading,
    HasOneResult,
    HasManyResults,
    HasNoResults,
    HasError
  } = CarouselState;

  // render JSX
  switch (carouselState) {

    case IsLoading:
      return (<LoadingContent />)

    case HasNoResults:
      return (<FeaturedCarouselInvite contentCardContainerStyles={{
        borderRadius: 10,
      }}
      />)

    case HasOneResult:
      return (
        <Content
          student={items[0]}
          currentAffiliation={currentAffiliation}
          navigateToCarousel={navigateToCarousel}
          accessibilityLabelContentAreaClick={'Featured Member Profile'}
          carouselState={carouselState}
          onLayout={() => {
            VisiteesByOrigin({
              ...VisiteesByOrigin(),
              [`${route.name}:carousel:home`]: items[0].personId
            })
          }}
        />
      )

    case HasManyResults:
      return getCarousel();

    case HasError:
      return <FeaturedCarouselError />
  }
}
