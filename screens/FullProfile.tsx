import { useQuery } from '@apollo/client';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { FetchUserResponse, FETCH_USER_DATA } from '../data/queries/user-data/fetch';
import { Content } from '../src/components/carousels/profile';
import { ScreenLoadingIndicator } from '../src/components/helpers/screen-loading-indicator';
import { Text } from '../src/components/Text';
import { useFocusedStatus } from '../src/hooks';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/global-stylesheet';
import { BirthDateConfidenceLevel } from '../types/interfaces';
import { ClasslistStackParamList, ConversationsStackParamList } from '../types/types';
import { FontAwesome5 } from '@expo/vector-icons';
import { VisiteesByOrigin } from '../src/hooks/useVisiteeIdByOrigin';

type FullProfileScreenProps = NativeStackScreenProps<ConversationsStackParamList & ClasslistStackParamList, '_fullProfile'>

export const FullProfileScreen = ({ route, navigation }: FullProfileScreenProps): JSX.Element => {
  useFocusedStatus(navigation, route, false);
  const { targetId = '' } = route.params;

  const { data, loading: isLoading } = useQuery<FetchUserResponse>(FETCH_USER_DATA, {
    variables: {
      id: targetId
    },
    onError(error) {
      DdRum.addError(
        error.message || 'could not fetch user profile',
        ErrorSource.SOURCE,
        error.stack || __filename,
        {
          error,
          regId: targetId
        },
        Date.now()
      )
    },
  })

  useEffect(() => {
    VisiteesByOrigin({
      ...VisiteesByOrigin(),
      [`${route.name}:profile:people`]: targetId
    })
    return () => {
      const visitees = VisiteesByOrigin();
      delete visitees[`${route.name}:profile:people`];
      VisiteesByOrigin(visitees)
    }
  }, [])

  const doManageBlockedUsers = () => {
    navigation.getParent()?.navigate('BlockedUsers')
  }

  if (isLoading) {
    return (
      <ScreenLoadingIndicator />
    )
  }

  if (data && data.people) {
    const { id, firstName, lastName, photos, primaryAffiliation, visits, nowPhoto, thenPhoto, isBlocked } = data.people[0];

    if (isBlocked) {
      return (
        <View style={styles.blockedContainer}>
          <View style={styles.blockedView}>
            <FontAwesome5 name="exclamation-triangle"
              size={30}
              color={Colors.orange1}
              style={{ margin: 10 }}
            />
            <Text
              isBold={true}
              style={[styles.text, { fontSize: 24 }]}
            >This profile is blocked</Text>
            <Text style={styles.text}>This profile belongs to a member you have blocked. Per your request, you will not be able to view this content.</Text>
            <Text
              isBold={true}
              style={[styles.text, globalStyles.linkColor, { marginVertical: 20 }]}
              onPress={doManageBlockedUsers}
            >Manage blocked profiles</Text>
          </View>
        </View>
      )
    }

    return (
      <View style={{
        padding: 10
      }}
      >
        {
          (
            Boolean(primaryAffiliation?.schoolId)
          ) && <Content
            student={{
              firstName,
              lastName,
              id,
              personId: id,
              photos: photos,
              thenPhoto: thenPhoto,
              nowPhoto: nowPhoto,
              visits,
              schoolId: primaryAffiliation?.schoolId,
              school: { schoolName: primaryAffiliation?.schoolName || '' },
              gradYear: primaryAffiliation?.gradYear || primaryAffiliation?.endYear || '',
              hasBirthdateAvailable: false,
              birthDate: '',
              birthDateConfidenceLevel: BirthDateConfidenceLevel.NOT_SET
            }}
            index={0}
            length={0}
            navigation={navigation.getParent()}
            isSinglePage={true}
          />
        }
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={[globalStyles.errorText, { fontSize: 20, fontWeight: 'bold' }]}>Oops!</Text>
      <Text style={globalStyles.errorText}>There was an error while loading the user. Please go back, and try again later.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  blockedContainer: {
    ...globalStyles.container,
    backgroundColor: Colors.gray,
    padding: 20,
    justifyContent: 'flex-start'
  },
  blockedView: {
    padding: 20,
    backgroundColor: Colors.whiteRGBA(),
    borderRadius: 10
  },
  text: {
    margin: 10,
    fontSize: 18
  }
})
