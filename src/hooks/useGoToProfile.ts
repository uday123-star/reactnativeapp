import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';
import { useIsSignedIn } from '../../redux/hooks';
import { RootStackParamList } from '../../types/types';

const CLASSMATES_STAFF_ID = '100'

export const useGoToProfile = (id: string): (id: string) => void => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isSignedInUser = useIsSignedIn(id);

  return useCallback((id) => {
    // never navigate to profiles for these ids
    const preventNavigationList: string[] = [CLASSMATES_STAFF_ID]

    if (preventNavigationList.includes(id)) {
      return;
    }

    if (isSignedInUser) {
      console.log('jump to my profile')
      return;
    }

    navigation.navigate('Classlist', { screen: '_fullProfile', params: { targetId: id }})
  }, [id])
};
