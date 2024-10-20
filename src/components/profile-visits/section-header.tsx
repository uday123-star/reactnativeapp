import * as React from 'react'
import { ScreenWidth } from '@freakycoder/react-native-helpers'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder'
import { globalStyles } from '../../../styles/global-stylesheet'
import { TouchableOpacity } from 'react-native-gesture-handler'
import InfoCircle from '../../../assets/images/information.svg'
import { ProfileVisitState } from '../../../redux/slices/profile-visits/slice'
import { useAppSelector } from '../../../redux/hooks'

interface Props {
  title: string
  count: string
  forceLoadingState?: boolean
  showInfoCircle?: boolean
  onPressInfoCircle?: () => void
}

export const ListSectionHeader = ({ title, count, forceLoadingState = false, showInfoCircle = false, onPressInfoCircle }: Props): JSX.Element => {
  const profileVisitState = useAppSelector(state => state.profileVisits.profileVisitState);
  const { isLoading, isReloading } = ProfileVisitState;
  const shouldShowLoader = forceLoadingState || [isLoading, isReloading].includes(profileVisitState);

  const shouldShowInfoCircle = !shouldShowLoader && showInfoCircle;

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', width: ScreenWidth * 0.85 }}>
          {shouldShowLoader &&
            <Placeholder Animation={Fade}><PlaceholderLine /></Placeholder>
          }
          {!shouldShowLoader &&
            <Icon.Button name="user"
              size={28}
              color={'black'}
              backgroundColor={'transparent'}
              iconStyle={{ marginTop: -8, marginRight: 0 }}
            />
          }
          {!shouldShowLoader &&
            <Text style={globalStyles.sectionHeaderText}>
              {count} {title}
            </Text>
          }
        </View>
        {shouldShowInfoCircle &&
          <TouchableOpacity
            onPress={onPressInfoCircle}
            style={{ marginTop: 4 }}
          >
            <InfoCircle />
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}
