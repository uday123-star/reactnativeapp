import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers'
import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { titleize } from '../../../helpers/string'
import { AffiliationModel, StudentModel } from '../../../../types/interfaces'
import { BackButton } from '../../BackButton'
import { ForwardButton } from '../../ForwardButton'
import { UserFeaturedItem } from '../../UserFeaturedItem'
import { Screens } from '../../../helpers/screens'
import * as Device from 'expo-device'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ClasslistStackParamList } from '../../../../types/types'
import { getClassTitle } from '../../../../redux/slices/current-affiliation/helpers'

type parentProps = NativeStackScreenProps<ClasslistStackParamList, '_carousel'>
interface ContentProps extends Partial<parentProps> {
  student: StudentModel
  navigateBack?: () => void
  navigateForward?: () => void
  index: number
  length: number
}

export const EmptyContent = ({ student, navigateBack, navigateForward, index, length }: ContentProps): JSX.Element => {
  const affiliation: Partial<AffiliationModel> = {
    schoolId: student.schoolId,
    schoolName: student.school?.schoolName,
    gradYear: student.gradYear,
  }
  const { firstName, lastName } = student;
  const screens = new Screens();
  const viewHeight = (Device.osName === 'iOS' ?
    (ScreenHeight - (screens.getFooterHeight() + screens.getHeaderHeight()) - 20) :
    (ScreenHeight - ((screens.getFooterHeight() + screens.getHeaderHeight()) * 2) + 20)
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={{ right: 1 }}
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        height: viewHeight,
        padding: 20,
        margin: 10,
      }}
    >

      {/* Profile Navigation */}
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginLeft: -24, width: ScreenWidth * 0.2 }}>
            {index > 0 &&
              <BackButton
                onPress={navigateBack}
                shouldUseCustomOnPress={true}
              />
            }
          </View>
          <Text style={{ width: ScreenWidth * 0.6, fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
            <Text>{titleize(`${firstName} ${lastName}`)}</Text>
            {'\n'}{getClassTitle((affiliation.gradYear || affiliation.endYear || ''), affiliation.role === 'STUDENT', affiliation.startYear || '', true)}
          </Text>
          <View style={{ width: ScreenWidth * 0.1 }}>
            {index < (length - 1) &&
              <ForwardButton onPress={navigateForward} />
            }
          </View>
        </View>
      </View>

      {/* Profile Card */}
      <View>
        <UserFeaturedItem
          student={student}
          affiliation={affiliation}
          shouldShowActions={true}
        />
      </View>
    </ScrollView>
  )
}
