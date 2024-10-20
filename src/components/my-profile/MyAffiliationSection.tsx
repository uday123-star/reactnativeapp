import * as React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import InfoCircle from '../../../assets/images/information.svg'
import { Affiliation } from '../../../data/queries/affiliations/fetch-all-affiliations'
import { getClassTitle } from '../../../redux/slices/current-affiliation/helpers'
import { Placeholder, PlaceholderLine, Fade, PlaceholderMedia } from 'rn-placeholder'
import { PrimaryAffiliationModal } from '../profile-visits/primary-affiliation-modal'
import { useMutation } from '@apollo/client'
import { UPDATE_PRIMARY_AFFILIATION } from '../../../data/queries/affiliations/update-primary'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { getSessionData } from '../../helpers/session'

interface Props {
  affiliation: Affiliation
  onUpdate: () => void
}

export const MyAffiliationSection = ({ affiliation, onUpdate }: Props): JSX.Element => {

  const [isPrimaryAffiliationModalVisible, setIsPrimaryAffiliationModalVisible] = React.useState(false);
  const { schoolName, startYear, endYear } = affiliation;

  const [ updateAffiliation, { loading, error } ] = useMutation(UPDATE_PRIMARY_AFFILIATION)

  const _updatePrimaryAffiliation = () => {
    const variables = {
      affiliationId: affiliation.id
    };
    const sessionData = getSessionData();
    updateAffiliation({
      variables,
      onCompleted: onUpdate,
      onError: (error) => DdRum.addError('Update Primary Affiliation', ErrorSource.CUSTOM, error.message || 'Error updating comment', {
        session: sessionData,
        variables
      }, Date.now())
    })
  }

  if (loading || error) {
    if (error) {
      return (
        <Text>Oops. Error while loading.</Text>
      )
    }
    return (
      <Placeholder Animation={Fade} style={{ marginTop: 15, marginBottom: 10 }}>
        <PlaceholderLine width={50} />
        <PlaceholderLine width={50} />
        <PlaceholderLine width={20} />
        <PlaceholderLine width={80} />
        <PlaceholderMedia />
      </Placeholder>
    )
  }
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 15 }}>
        {affiliation.primary === true && (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 12 }}>PRIMARY AFFILIATION</Text>
            <TouchableOpacity
              onPress={() => setIsPrimaryAffiliationModalVisible(true)}
              accessible={true}
              accessibilityLabel='Primary Affiliation info'
              accessibilityRole='button'
            >
              <InfoCircle style={{ margin: 10 }} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text
        style={{ fontSize: 16, marginBottom: 10 }}
        accessible={true}
        accessibilityRole='text'
        accessibilityLabel={affiliation.primary === true ? 'Primary Affiliation School Name' : 'Affiliation School Name'}
      >{schoolName}{'\n'}{getClassTitle(endYear)}</Text>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>You are listed as:</Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>{getAffiliatedName(affiliation)}{'\n'}Attended: {startYear}-{endYear}</Text>
      {/* <TouchableOpacity style={{ flexDirection: 'row', marginTop: 10 }}
        onPress={() => alert('edit this affiliation')}
      >
        <Icon.Button name="edit"
          size={20}
          color={'black'}
          backgroundColor={'transparent'}
          iconStyle={{ marginTop: -8, marginRight: 0 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }}>Edit</Text>
      </TouchableOpacity> */}
      {/* {!affiliation.primary &&
        <TouchableOpacity style={{ flexDirection: 'row', marginTop: 10 }}
          onPress={() => alert('delete this affiliation')}
        >
          <Icon.Button name="times-circle"
            size={20}
            color={'black'}
            backgroundColor={'transparent'}
            iconStyle={{ marginTop: -8, marginRight: 0 }}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }}>Delete</Text>
        </TouchableOpacity>
      } */}
      {!affiliation.primary &&
        <TouchableOpacity style={{ flexDirection: 'row', marginTop: 10 }}
          onPress={_updatePrimaryAffiliation}
          accessible={true}
          accessibilityLabel='Make this school my Primary Affiliation'
          accessibilityRole='link'
        >
          <Icon.Button name="graduation-cap"
            size={20}
            color={'black'}
            backgroundColor={'transparent'}
            iconStyle={{ marginTop: -8, marginRight: 0 }}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#009999' }}>Make this school my Primary{'\n'}Affiliation</Text>
        </TouchableOpacity>
      }
      <PrimaryAffiliationModal isModalVisible={isPrimaryAffiliationModalVisible} onClose={() => setIsPrimaryAffiliationModalVisible(false)} />
    </View>
  )

}

function getAffiliatedName(affiliation: Affiliation): string {
  const { firstName, lastName } = affiliation;
  return `${firstName} ${lastName}`;
}

