import { useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global-stylesheet';
import { DeleteVisitsResponse, VisitsResponse, VisitTypeEnum } from '../../../types/interfaces';
import { DELETE_VISIT, DeleteVisitsArgs } from '../../../data/queries/visits/delete';
import { Modal } from '../Modal';
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native';

interface Props {
  onClose(visit?: Partial<VisitsResponse>): void
  onModalHide(hasError: boolean, visit?: Partial<VisitsResponse>): void
  visiteeId: string
  visitId: string
  isVisible: boolean
}

export const RemoveVisitModal = ({ onClose, onModalHide, visitId, visiteeId, isVisible }: Props): JSX.Element => {
  const [ deleteVisit, { data, loading, error } ] = useMutation<DeleteVisitsResponse>(DELETE_VISIT);
  const [ hasError, setHasError ] = useState(false);
  const [ erroredVisit, setErroredVisit ] = useState<Partial<VisitsResponse>>();

  useEffect(() => {
    if (!loading && !error && data) {
      if (data.deleteVisit.visitType === VisitTypeEnum.permanent) {
        setHasError(true);
        setErroredVisit(data.deleteVisit);
        return onClose();
      }
      return onClose(data.deleteVisit);
    }
    if (!loading && error) {
      setHasError(true);
      setErroredVisit(undefined);
      return onClose();
    }
  }, [ data, loading, error ]);

  const removeVisit = async () => {
    const variables: DeleteVisitsArgs = {
      visitId,
      visiteeId
    };
    deleteVisit({
      variables,
      onError(error) {
        DdRum.addError(
          error.message || 'An error occured while removing a visit',
          ErrorSource.CONSOLE,
          error.stack || 'no stack available',
          {
            visiteeId,
            visitId
          }
        )
      },
      onCompleted(data) {
        const { CUSTOM } = RumActionType;
        DdRum.addAction(CUSTOM, 'delete visit', {
          data
        }, Date.now());
      },
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            ...data?.deleteVisit
          }),
          fields: {
            visitType() {
              return data?.deleteVisit.visitType
            }
          },
        })
      }
    })
  }

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      onModalHide={() => onModalHide(hasError, erroredVisit)}
    >
      <View style={{ margin: 16 }}>
        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          When you visit a schoolmate&apos;s page, you&apos;re letting them know you&apos;ve been thinking about them and are
          interested in hearing what they&apos;ve been up to.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          Sending them a notification that you&apos;ve visited is a great way to start reconnecting,
          but if you rather view their profile anonymously, you can certainly do that as well. To browse someone&apos;s profile
          anonymously, you&apos;ll need to change your privacy settings found on your account page and turn off “normal mode.”
        </Text>
        <View style={[styles.inline]}>
          <TouchableOpacity onPress={removeVisit}>
            <Text 
              accessibilityLabel='remove visit' 
              accessibilityRole='button' 
              style={[globalStyles.carouselLinkStyle, { marginBottom: 20, textAlign: 'left', flexGrow: 1 }]}
            >
              REMOVE VISIT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onClose()}>
            <Text style={[globalStyles.carouselLinkStyle, { marginBottom: 20, textAlign: 'right', flexGrow: 1 }]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
  }
});
