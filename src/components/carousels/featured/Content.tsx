import React from 'react';
import { Card } from 'react-native-elements';
import { Button } from '../../../components/Button';
import { StudentModel, AffiliationModel } from '../../../../types/interfaces';
import { UserFeaturedItem } from '../../UserFeaturedItem';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import GuestbookVisitBar from '../../guestbook/carousel-visit-bar';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';
import { CarouselState } from '../../../../redux/slices/feature-carousel/slice';

type NavigateToCarousel = ({ student, currentAffiliation }: { student: StudentModel; currentAffiliation: AffiliationModel }) => void

interface Props {
  student: StudentModel
  currentAffiliation: AffiliationModel
  contentCardContainerStyles?: StyleProp<ViewStyle>
  accessibilityLabelContentAreaClick?: string
  navigateToCarousel: NavigateToCarousel
  carouselState: CarouselState
  onLayout?: (event: LayoutChangeEvent) => void
}

export const Content = ({ student, currentAffiliation, contentCardContainerStyles, accessibilityLabelContentAreaClick = '', navigateToCarousel, carouselState, onLayout }: Props): JSX.Element | null => {
  const isLoading = carouselState === CarouselState.IsLoading;

  const loadingButton = (): JSX.Element => {
    return (
      <Placeholder
        Animation={Fade}
      >
        <PlaceholderLine width={100}
          height={25}
          style={{ margin: 0, padding: 0 }}
        />
      </Placeholder>

    )
  }
  return (
    <View onLayout={onLayout}>
      <Card containerStyle={contentCardContainerStyles}>
        <UserFeaturedItem
          isLoading={isLoading}
          student={student}
          affiliation={currentAffiliation}
          accessibilityLabelContentAreaClick={accessibilityLabelContentAreaClick}
          onPress={() => navigateToCarousel({ student, currentAffiliation })}
        />
        <GuestbookVisitBar
          student={student}
          visitOrigin='carousel:home'
        />
        {
          isLoading
            ? loadingButton()
            : <Button
                title="VIEW FULL PROFILE"
                accessibilityLabel='View Full Profile'
                accessible={true}
                onPress={() => navigateToCarousel({ student, currentAffiliation })}
            />
        }
      </Card>
    </View>
  );
}

