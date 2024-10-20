import { useMutation } from '@apollo/client';
import { useState } from 'react';
import React, { TextInput, View } from 'react-native';
import { Button } from '../Button';
import { ReportedEntityType, ReportInput, REPORT_ENTITY } from '../../../data/queries/security/report';
import { useCurrentUserId } from '../../../redux/hooks';
import { Colors } from '../../../styles/colors';
import BasicAlert from '../BasicAlert';
import { Modal } from '../Modal';
import { DdRum, ErrorSource } from '@datadog/mobile-react-native';
import { getSessionData } from '../../helpers/session';

interface Props {
  type: ReportedEntityType
  entityId: string
  /**
   * Required for photos only
   */
  url?: string
  onClose(): void
}

export const ReportContentModal = ({ type, entityId, url, onClose }: Props): JSX.Element => {
  const currentUserId = useCurrentUserId();
  const [ reportText, setReportText ] = useState<string>();
  const [ addReport, {
    loading: reportLoading
  }] = useMutation(REPORT_ENTITY, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true
  });
  const _sendReport = () => {
    const variables: ReportInput = {
      reportedEntityId: entityId,
      reporterId: currentUserId,
      reportedEntityType: type,
      entityContext: {
        url,
        id: entityId
      },
      reporterComment: reportText
    }
    addReport({
      variables,
      onError: (error) => {
        BasicAlert.show({
          title: 'Report',
          text: 'Oops!! There was an error sending your report, try again later.',
        });
        const sessionData = getSessionData();
        DdRum.addError('Report Content', ErrorSource.SOURCE, error.message || 'Error sending a report', {
          session: sessionData,
          variables
        }, Date.now());
      },
      onCompleted: () => {
        BasicAlert.show({
          title: 'Report',
          text: 'Your report was successfully sent!',
        });
      }
    })
  }

  const {
    PERSONAL_MESSAGE,
    PROFILE,
    COMMENT,
    NOTE,
    PHOTO,
  } = ReportedEntityType;

  const getPlaceholder = () => {
    switch (type) {
      case PROFILE:
        return 'Why are you reporting this profile?';
      case PHOTO:
        return 'Why are you reporting this image?';
      case PERSONAL_MESSAGE:
        return 'Why are you reporting this message?';
      case COMMENT:
        return 'Why are you reporting this comment?';
      case NOTE:
        return 'Why are you reporting this note?';
    }
  }

  return (<Modal
    isVisible={true}
    onClose={onClose}
  >
    <View>
      <TextInput
        style={{
          backgroundColor: Colors.whiteLevel(0),
          padding: 10,
          fontSize: 16,
          margin: 0,
          height: 60
        }}
        placeholder={getPlaceholder()}
        multiline={true}
        onChangeText={(text) => setReportText(text)}
        accessible={true}
        accessibilityLabel='Why are you reporting this?'
        accessibilityRole='text'
      />
      <Button
        title={'REPORT'}
        onPress={() => {
          _sendReport();
          onClose();
        }}
        disabled={reportLoading}
        accessible={true}
        accessibilityLabel='Report this content'
        borderRadius={0}
      />
    </View>
  </Modal>)
}
