import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import { Modal } from './Modal'
import Icon from 'react-native-vector-icons/FontAwesome'
import { titleize } from '../helpers/string'
import { setAllAffiliations } from '../../redux/slices/all-affiliations/slice'
import { List } from 'react-native-paper'
import { AffiliationModel } from '../../types/interfaces'
import { selectCurrentAffiliationThunk } from '../../redux/slices/current-affiliation/thunks'
import { TitleBar } from './TitleBar'
import { useAppThunkDispatch } from '../../redux/store'
import { useQuery } from '@apollo/client'
import { Affiliations, FETCH_ALL_AFFILIATIONS } from '../../data/queries/affiliations/fetch-all-affiliations'
import { useCurrentAffiliation } from '../../redux/hooks'
import { isAndroid } from '../helpers/device'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { getSessionData } from '../helpers/session'
import { useAffiliationYearRange } from '../hooks'

interface DropdownProps {
  title?: string
  titleComponent?: JSX.Element
  showGradYear?: boolean
  showSchoolName?: boolean
  showSchoolLocation?: boolean
  onChange?(affiliation: AffiliationModel): void
}

export const AffiliationDropdown = (props: DropdownProps): (JSX.Element | null) => {
  const { title, titleComponent, showGradYear = false, showSchoolName = false, showSchoolLocation = false, onChange } = props;
  const dispatchThunk = useAppThunkDispatch();
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const { data } = useQuery<Affiliations>(FETCH_ALL_AFFILIATIONS, {
    fetchPolicy: 'cache-first',
    onError: (error) => {
      const sessionData = getSessionData();
      DdRum.addError('Fetching All Affiliations', ErrorSource.CUSTOM, error.message || 'Error Fetching All Affiliations', {
        session: sessionData,
      }, Date.now())
    }
  });
  const currentAffiliation = useCurrentAffiliation();
  const { classText } = useAffiliationYearRange();

  if (!currentAffiliation || !data) {
    return null
  }

  const { schoolName, schoolCity, schoolState } = currentAffiliation;

  const doSelectSchool = (affiliation: AffiliationModel) => {
    dispatchThunk(selectCurrentAffiliationThunk({ affiliationId: String(affiliation.id) }));
    onChange && onChange(affiliation);
    setIsModalVisible(false)
  }
  const schoolList = data.affiliations.map((affiliation, i) => {
    const right = () => {
      const label = (label: string) => (
        <View
          style={{
            marginLeft: 10
          }}
        >
          <Text style={{
            fontSize: 10,
            backgroundColor: '#000',
            color: '#fff',
            textTransform: 'capitalize',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 12,
            overflow: 'hidden',
          }}
          >{label}</Text>
        </View>
      )
      if (affiliation.role === 'STUDENT') {
        if (currentAffiliation.id === affiliation.id) {
          return label('current');
        }
        return;
      }
      return label(affiliation.role);
    }
    return (
      <List.Item
        title={<View
          style={{
            flex: isAndroid() ? 1 : undefined,
            flexDirection: 'row',
            alignItems: 'center',
            paddingEnd: 10
          }}
        >
          <View style={{
            flexShrink: 1
          }}
          >
            <Text>{affiliation.schoolName}</Text>
          </View>
          {right()}
        </View>}
        key={i}
        accessibilityLabel='School name'
        accessible={true}
        accessibilityRole='button'
        style={{ paddingHorizontal: 0 }}
        onPress={() => doSelectSchool(affiliation)}
      />
    )
  });

  const AffiliationTitle = () => {
    if (titleComponent) {
      return titleComponent;
    }
    return (<Text
      fontSizePreset={1}
      isBold
      textWhite
      accessibilityLabel={title ? 'Affiliation Dropdown title' : 'Class of'}
      accessibilityRole='text'
      accessible={true}
    >{title ? title : classText}</Text>)
  }

  return (
    <TitleBar
      onLayout={() => {
        dispatchThunk(setAllAffiliations(data.affiliations))
      }}
    >
      <View>
        <AffiliationTitle />
        {showSchoolName && <Text
          textWhite
          style={{ fontSize: 18 }}
          accessibilityLabel='School name'
          accessibilityRole='text'
          accessible={true}
        >{schoolName}</Text>}
        {showSchoolLocation && <Text
          textWhite
          accessibilityLabel='School city'
          accessibilityRole='text'
          accessible={true}
        >{titleize(schoolCity)}, {schoolState.toUpperCase()}</Text>}
        {showGradYear && <Text
          textWhite
          accessibilityLabel='Gradyear'
          accessibilityRole='text'
          accessible={true}
        >{classText}</Text>}
      </View>
      {
        (!!data.affiliations.length && data.affiliations.length > 1) && (
          <TouchableOpacity style={styles.icon}
            accessibilityLabel='Change current class'
            accessible={true}
            accessibilityRole='button'
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="angle-down"
              size={40}
              color='white'
            />
          </TouchableOpacity>
        )
      }
      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <View>
          <List.Section>
            {schoolList}
          </List.Section>
          <TouchableOpacity
            accessibilityLabel='Cancel changing affiliation'
            accessible={true}
            accessibilityRole='button'
            onPress={() => setIsModalVisible(false)}
            style={styles.cancelButtonWrapper}
          >
            <View>
              <Text style={[styles.defaultText, styles.cancelButton]}>Cancel</Text>
            </View>

          </TouchableOpacity>
        </View>
      </Modal>
    </TitleBar>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 5,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    textTransform: 'capitalize',
  },
  defaultText: {
    color: 'white',
    fontSize: 16
  },
  icon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelButtonWrapper: {
    borderBottomColor: 'rgb(0,153,153)',
    borderBottomWidth: 1,
    backgroundColor: 'rgb(0,153,153)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cancelButton: {
    fontSize: 18,
    padding: 20,
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: '#f1f1f1',
    opacity: 0.4
  },
  selected: {
    backgroundColor: '#f3f3f3'
  }
})
