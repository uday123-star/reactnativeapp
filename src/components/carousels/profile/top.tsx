import React from 'react'
import { View, Text } from 'react-native'
import { titleize } from '../../../helpers/string'
import { AffiliationModel, StudentModel } from '../../../../types/interfaces'
import { BackButton } from '../../BackButton'
import { ForwardButton } from '../../ForwardButton'
import { UserFeaturedItem } from '../../UserFeaturedItem'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ClasslistStackParamList } from '../../../../types/types'
import GuestbookVisitBar from '../../guestbook/carousel-visit-bar'
import { getClassTitle } from '../../../../redux/slices/current-affiliation/helpers'

type parentProps = NativeStackScreenProps<ClasslistStackParamList, '_carousel'>
interface ContentProps extends Partial<parentProps> {
  student: StudentModel
  navigateBack?: () => void
  navigateForward?: () => void
  index: number
  length: number
}

export const TopContent = ({ student, navigateBack, navigateForward, index, length }: ContentProps): JSX.Element => {
  const affiliation: Partial<AffiliationModel> = {
    schoolId: student.schoolId,
    schoolName: student.school?.schoolName,
    gradYear: student.gradYear,
  }
  const { firstName, lastName } = student;
  const classTitleGradYear = (affiliation.gradYear || affiliation.endYear || '')
  const classTitleStartYear = affiliation.startYear || ''
  // We assume we're only dealing with students here, because
  // graphql-api is filtering out non-student roles.
  const isStudent = true
  const classTitle = getClassTitle(classTitleGradYear, isStudent, classTitleStartYear, true)

  return (<View
    style={{
      paddingHorizontal: 20,
      paddingTop: 20
    }}
  >
    {/* Profile Navigation */}
    <View>
      <View style={{ flex:1, flexDirection: 'row' }}>
        <View style={{ flexShrink: 1, flexBasis: 40 }}>
          {index > 0 &&
            <BackButton
              onPress={navigateBack}
              shouldUseCustomOnPress={true}
              iconStyle={{
                marginLeft: -25
              }}
            />
          }
        </View>
        <View style={{ flexGrow: 1, flexBasis: 'auto' }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
            <Text>{titleize(`${firstName} ${lastName}`)}</Text>
            {'\n'}{classTitle}
          </Text>
        </View>
        <View style={{ flexShrink: 1, flexBasis: 40 }}>
          {index < (length - 1) &&
            <ForwardButton
              onPress={navigateForward}
              iconStyle={{
                marginLeft: 25
              }}
            />
          }
        </View>
      </View>
    </View>

    {/* Profile Card Section */}
    <View>
      <UserFeaturedItem
        student={student}
        affiliation={affiliation}
        shouldShowActions={true}
      />
      <View style={{ flexDirection: 'row' }}>
        <GuestbookVisitBar
          student={student}
          visitOrigin='profile:people'
        />
      </View>
    </View>
  </View>)
}
