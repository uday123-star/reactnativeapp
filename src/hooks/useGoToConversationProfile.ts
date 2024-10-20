import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';
import { useIsSignedIn } from '../../redux/hooks';
import { ConversationsStackParamList } from '../../types/types';

const CLASSMATES_STAFF_ID = '100'

export const useGoToConversationProfile = (id: string): (id: string) => void => {
  const navigation = useNavigation<StackNavigationProp<ConversationsStackParamList>>();
  const isSignedInUser = useIsSignedIn(id);

  return useCallback((id) => {
    // never navigate to profiles for these ids
    const preventNavigationList: string[] = [CLASSMATES_STAFF_ID]

    if (preventNavigationList.includes(id)) {
      return;
    }

    if (isSignedInUser) {
      navigation.navigate('_myProfile')
      return;
    }

    navigation.navigate('_fullProfile', { targetId: id, });
  }, [id])
};
