import React, { useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { titleize } from '../helpers/string'
import { AffiliationModel, Photo, StudentModel } from '../../types/interfaces'
import ConditionalWrapper from './helpers/ConditionalWrapper'
import { Placeholder, PlaceholderMedia, Fade, PlaceholderLine } from 'rn-placeholder'
import { useCurrentAffiliation, useCurrentUserId, useIsSignedIn } from '../../redux/hooks'
import { UserAvatar } from './UserAvatar'
import Icon from 'react-native-vector-icons/FontAwesome5';
import Octicon from 'react-native-vector-icons/Octicons';
import { Colors } from '../../styles/colors';
import { Menu, List } from 'react-native-paper';
import { Modal } from './Modal'
import { Button } from './Button'
import { useMutation } from '@apollo/client'
import { ReportedEntityType } from '../../data/queries/security/report'
import { BlockInput, BLOCK_PROFILE } from '../../data/queries/security/block'
import BasicAlert from './BasicAlert'
import { ReportContentModal } from './reports/ReportContentModal'
import { Comment, Conversation, Reply } from '../../data/queries/conversations/types'
import { useNavigation } from '@react-navigation/native'
import { ConversationsActivityResponse, GET_CONVERSATIONS_ACTIVITY } from '../../data/queries/conversations/activity'
import { setBlockState, useAffiliationYearRange } from '../hooks'
import { useGoToProfile } from '../hooks/useGoToProfile'
import { BlockedStudents } from '../adapters/apollo-client.adapter'

interface UserFeaturedItemProps {
  student: Partial<StudentModel>
  affiliation: Partial<AffiliationModel>
  onPress?: () => void
  accessibilityLabelContentAreaClick?: string
  isLoading?: boolean
  shouldShowActions?: boolean
}

export const UserFeaturedItem = ({ isLoading, student, affiliation, accessibilityLabelContentAreaClick = '', onPress, shouldShowActions = false }: UserFeaturedItemProps): JSX.Element => {
  const isSignedIn = useIsSignedIn(student.personId || '');
  const { nowPhoto, thenPhoto } = student;
  const currentAffiliation = useCurrentAffiliation();
  const currentUserId = useCurrentUserId();
  const { end: endYear } = useAffiliationYearRange();
  const navigation = useNavigation();
  const goToProfile = useGoToProfile(student.personId || '')

  const nowPhotoUrl = nowPhoto?.display?.url;
  const thenPhotoUrl = thenPhoto?.display?.url;
  const shouldShowNamePlates = nowPhotoUrl && thenPhotoUrl;

  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const [ menuPosition, setMenuPosition ] = useState({
    x: 0,
    y: 0
  });

  const [ isReportModalVisible, setIsReportModalVisible ] = useState(false);

  const [ blockProfile, {
    data: blockData,
    error: blockError,
    loading: blockLoading
  }] = useMutation(BLOCK_PROFILE, {
    fetchPolicy: 'network-only'
  });
  const [ isBlockModalVisible, setIsBlockModalVisible ] = useState(false);
  const _blockProfile = async () => {
    const reportVariables: BlockInput = {
      personId: student.personId || ''
    }
    await blockProfile({
      variables: reportVariables,
      onCompleted: () => {
        setBlockState({
          action: 'block',
          personId: student.personId || ''
        });
      },
      update: (cache) => {
        // Person Record: Used when loading a profile
        const cachedPerson = cache.identify({
          __typename: 'Person',
          id: student.personId
        });
        cache.modify({
          id: cachedPerson,
          fields: {
            isBlocked: () => true
          }
        });
        // Student Records: used on classlist screen & Featured Carousel & New Members
        if (student.personId) {
          BlockedStudents([...BlockedStudents(), student.personId])
        }

        // Conversations content: Conversations, Comments, Replies
        const serializedState = cache.extract();
        const cachedItems = Object.values(serializedState);
        const conversationsContent: (Conversation | Comment | Reply)[] = cachedItems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => (
          (item.__typename === 'Conversation' ||
          item.__typename === 'Comment' ||
          item.__typename === 'Reply') &&
          item.posted_by.registration_id === student.personId
        )) as (Conversation | Comment | Reply)[];
        conversationsContent.forEach((item) => {
          if (item.__typename === 'Reply' && 'comment_id' in item) {
            cache.modify({
              id: `Comment:${item.comment_id}`,
              fields: {
                replies_count: (replies_count) => replies_count - 1
              }
            });
          }
          if (item.__typename === 'Comment' && 'conversation_id' in item) {
            cache.modify({
              id: `Conversation:${item.conversation_id}`,
              fields: {
                comments_count: (comments_count) => comments_count - 1
              }
            });
          }
          cache.modify({
            id: `${item.__typename}:${item.id}`,
            fields: (content, { DELETE }) => {
              return DELETE;
            }
          });
        });

        // Photos content
        const photosContent: Photo[] = cachedItems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => (
          item.__typename === 'Photo' &&
          String(item.createdBy) === String(student.personId)
        )) as Photo[];
        photosContent.forEach((photo) => {
          const cachedPhoto = cache.identify({
            __typename: 'Photo',
            id: photo.id
          });
          cache.modify({
            id: cachedPhoto,
            fields: (photo, { DELETE }) => {
              return DELETE;
            }
          });
        })

        // Activity content
        const variables = {
          authorId: currentUserId,
          gradYear: Number(endYear),
          schoolId: currentAffiliation.schoolId,
          limit: 4
        };
        const activityData = cache.readQuery<ConversationsActivityResponse>({
          query: GET_CONVERSATIONS_ACTIVITY,
          variables
        })
        if (activityData) {
          const records = activityData.conversationsSiteNotifications
            .filter((notification) => notification.actor.registration_id !== student.personId);
          cache.writeQuery({
            query: GET_CONVERSATIONS_ACTIVITY,
            variables,
            data: {
              ...activityData,
              conversationsSiteNotifications: records
            }
          })
        }
      }
    });
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  if (isReportModalVisible && blockData && !blockError && !blockLoading) {
    setIsReportModalVisible(false);
    BasicAlert.show({
      title: 'Block Profile',
      text: 'You successfully blocked this profile!',
    });
  }

  if (isReportModalVisible && blockError) {
    setIsReportModalVisible(false);
    BasicAlert.show({
      title: 'Block Profile',
      text: 'Oops!! There was an error blocking the profile, try again later.',
    });
  }

  const LoadingComponent = (): JSX.Element => {
    return (
      <Placeholder
        Animation={Fade}
      >
        <View style={{ height: 160, borderWidth: 3, borderColor: '#EEE' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
            <View style={{ marginVertical: 15 }}>
              <PlaceholderMedia />
            </View>
            <PlaceholderLine width={50} />
            <PlaceholderLine width={50} />
          </View>
        </View>
      </Placeholder>
    )
  }

  return (
    <ConditionalWrapper
      condition={!!onPress}
      wrapper={children => <TouchableOpacity
        accessibilityLabel={accessibilityLabelContentAreaClick}
        accessible={true}
        accessibilityRole='button'
        onPress={onPress}
      >{children}</TouchableOpacity>}
    >
      {isLoading
        ? LoadingComponent()
        :
        <View
          style={{ backgroundColor: '#BDE1E2', padding: 16, position: 'relative' }}
        >
          {Boolean(shouldShowActions) && <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 40,
              height: 40,
            }}
          >
            {!isSignedIn &&
              <Icon.Button name="flag"
                size={20}
                color={Colors.whiteRGBA()}
                backgroundColor={'transparent'}
                underlayColor={Colors.blackRGBA(0.01)}
                onPress={(event) => {
                  const { nativeEvent } = event;
                  setMenuPosition({
                    x: nativeEvent.pageX,
                    y: nativeEvent.pageY
                  });
                  openMenu();
                }}
                iconStyle={{
                  padding: 0,
                  margin: 0,
                }}
                style={{
                  padding: 0,
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
                accessible={true}
                accessibilityLabel='Profile actions'
                accessibilityRole='menu'
              />}
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              style={{
                width: 150,
              }}
              overlayAccessibilityLabel='Close profile actions menu'
              anchor={menuPosition}
            >
              <List.Item onPress={() => {closeMenu();setIsReportModalVisible(true);}}
                title="Report profile"
                left={
                  () => (<Octicon name='report'
                    size={16}
                    style={{
                      padding: 0, margin: 0, alignSelf: 'center'
                    }}
                  />)
                }
                accessible={true}
                accessibilityLabel='Report profile'
                accessibilityRole='button'
              />
              <List.Item onPress={() => {closeMenu();setIsBlockModalVisible(true)}}
                title="Block Profile"
                left={
                  () => (<Octicon name='circle-slash'
                    size={16}
                    style={{
                      padding: 0, margin: 0, alignSelf: 'center'
                    }}
                  />)
                }
                accessible={true}
                accessibilityLabel='Block profile'
                accessibilityRole='button'
              />
            </Menu>
          </View>
          }
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
            {
              Boolean(nowPhotoUrl) && (
                <UserAvatar
                  avatarSize={75}
                  user={student as StudentModel}
                  namePlate={shouldShowNamePlates ? 'NOW' : undefined}
                  onPress={() => goToProfile(String(student.personId))}
                />
              )
            }
            {
              Boolean(nowPhotoUrl && thenPhotoUrl) && (
                <Text>&nbsp;</Text>
              )
            }
            {
              Boolean(thenPhotoUrl) && (
                <UserAvatar
                  avatarSize={75}
                  user={student as StudentModel}
                  shouldUseThenPhoto={true}
                  namePlate={shouldShowNamePlates ? 'THEN' : undefined}
                  onPress={() => goToProfile(String(student.personId))}
                />
              )
            }

            {Boolean(!nowPhotoUrl && !thenPhotoUrl) && (
              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <UserAvatar user={student as StudentModel} onPress={() => goToProfile(String(student.personId))} />
              </View>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'center', margin: 10 }}>
            <Text
              style={{ fontSize: 20 }}
              numberOfLines={1}
              accessible={true}
              accessibilityLabel='Student Name'
              accessibilityRole='text'
            >{titleize(`${student.firstName} ${student.lastName}`)}</Text>
            <Text
              style={{ fontSize: 16 }}
              numberOfLines={1}
              accessible={true}
              accessibilityLabel='School and Grad year'
              accessibilityRole='text'
            >{affiliation.schoolName} &apos;{String(affiliation.gradYear || affiliation.endYear || '').slice(-2)}</Text>
          </View>
          {
            Boolean(isSignedIn) &&
            <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', paddingVertical: 10 }}>
              <Text style={{ padding: 10, backgroundColor: 'white', fontWeight: 'bold' }}>THIS IS YOU</Text>
            </View>
          }
          {Boolean(isReportModalVisible) && <ReportContentModal
            type={ReportedEntityType.PROFILE}
            entityId={student.personId || ''}
            onClose={() => setIsReportModalVisible(false)}
          />}
          <Modal
            isVisible={isBlockModalVisible}
            onClose={() => setIsBlockModalVisible(false)}
          >
            <View
              style={{
                width: '100%'
              }}
            >
              <Text
                style={{
                  padding: 20,
                  fontSize: 16
                }}
                accessible={true}
                accessibilityLabel='After blocking a user, they will not be able to see your profile or content, and you will no longer be able to see their profile or content.'
                accessibilityRole='text'
              >After blocking a user, they will not be able to see your profile or content, and you will no longer be able to see their profile or content.</Text>
              <View
                style={{
                  width: '100%',
                  position: 'relative',
                  height: 45
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    width: '50%',
                    left: 0,
                    backgroundColor: 'red'
                  }}
                >
                  <Button
                    title={'BLOCK'}
                    style={{
                      marginBottom: 0,
                    }}
                    onPress={() => {
                      setIsBlockModalVisible(false);
                      _blockProfile();
                    }}
                    disabled={blockLoading}
                    accessible={true}
                    accessibilityLabel='Block this user'
                    borderRadius={0}
                  />
                </View>
                <View
                  style={{
                    position: 'absolute',
                    width: '50%',
                    left: '50%',
                  }}
                >
                  <Button
                    title={'CANCEL'}
                    style={{
                      marginBottom: 0,
                    }}
                    onPress={() => setIsBlockModalVisible(false)}
                    disabled={blockLoading}
                    accessible={true}
                    accessibilityLabel='Cancel'
                    backgroundColor={Colors.mediumGray}
                    borderRadius={0}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      }
    </ConditionalWrapper>
  )
}
