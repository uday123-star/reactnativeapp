import React, { useState } from 'react'
import { Text } from 'react-native'
import { Colors } from '../../../styles/colors'
import { Placeholder, Fade, PlaceholderLine } from 'rn-placeholder'
import { dataDogStartAction } from '../../helpers/datadog'
import { CurrentUser } from '../../../types/interfaces'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { UpdateBioOptInResponse, UPDATE_BIO_OPT_IN } from '../../../data/queries/bio-opt-out/update'
import { useMutation } from '@apollo/client'
import BasicAlert from '../BasicAlert'

interface Props {
  currentUser: CurrentUser
}

export const BioOptOutSection = ({ currentUser }: Props) => {
  const [isOptedIn, setIsOptedIn] = useState<boolean>(currentUser?.settings?.privacy?.featureBioInEmails || false);
  const [ updateOptIn, { loading: isLoading } ] = useMutation<UpdateBioOptInResponse>(UPDATE_BIO_OPT_IN);

  const onPress = (featureBioInEmails = true) => {
    setIsOptedIn(prev => !prev)
    dataDogStartAction(RumActionType.TAP, 'opt-out button', { isOptedIn })
    updateOptIn({
      variables: {
        featureBioInEmails
      },
      update: (cache, { data }) => {
        const cachedId = cache.identify({
          __typename: 'Person',
          id: currentUser.id
        });

        cache.modify({
          id: cachedId,
          fields: {
            settings: (settings) => ({
              ...settings,
              privacy: data?.updatePrivacySettings
            }),
          }
        })
      },
      onCompleted: ({ updatePrivacySettings }) => {
        setIsOptedIn(updatePrivacySettings?.featureBioInEmails)
      },
      onError: (error) => {
        BasicAlert.show({
          title: 'Stories',
          text: 'Oops! Sorry, there was a problem updating your preferences, try again later.'
        })

        DdRum.addError(
          error?.message || 'Oops! Sorry, there was a problem updating preferences, please try again later.',
          ErrorSource.SOURCE,
          error?.stack || __filename + '::optOutError',
          {
            error,
            currentUserId: currentUser.id,
            featureBioInEmails
          }
        )
      }
    })
  }

  const optOutText = 'Some Classmates® email newsletters spotlight member stories. If you\'d rather not have your story featured, you may opt out';
  const optInText = 'Some Classmates® email newsletters spotlight member stories. Let your school mates know when you\'ve updated yours by opting in to share yours.';

  if (isLoading) {
    return (
      <Placeholder Animation={Fade}>
        <PlaceholderLine />
        <PlaceholderLine />
      </Placeholder>
    )
  }

  if (isOptedIn) {
    return (
      <Text style={{ fontSize: 14 }} accessible={false}>
        Some Classmates&reg; email newsletters spotlight member stories.  If you&apos;d rather not have your story featured, you may
        <Text
          style={{ color: Colors.darkCyan }}
          onPress={() => onPress(false)}
          accessible={true}
          accessibilityLabel={optOutText}
          accessibilityRole='link'
        > opt out</Text>.
      </Text>
    )
  } else {
    return (
      <Text style={{ fontSize: 14 }} accessible={false}>
        Some Classmates&reg; email newsletters spotlight member stories.  Let your school mates know when you&apos;ve updated yours by
        <Text
          style={{ color: Colors.darkCyan }}
          onPress={() => onPress()}
          accessible={true}
          accessibilityLabel={optInText}
          accessibilityRole='link'
        > opting in </Text>
        to share yours.
      </Text>
    )
  }
}
