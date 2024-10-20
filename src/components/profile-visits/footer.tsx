import * as React from 'react'
import { View } from 'react-native';
import { useAppSelector } from '../../../redux/hooks'
import { ProfileVisitState } from '../../../redux/slices/profile-visits/slice'
import { LoadingListItem } from './list-item-loading';

// TODO: It would be nice if this
// component reflected the amount of
// items left on the server to load.
// for example, if there was 1 left - we only show 1
export const Footer = (): JSX.Element => {
  const { profileVisitState } = useAppSelector(state => state.profileVisits);
  return (
    <View>
      {profileVisitState === ProfileVisitState.isLoadingMore &&
        (<View>
          <LoadingListItem repeats={5} />
        </View>)
      }
    </View>
  )
}
