import React, { Ref, useContext, useEffect, useRef, useState } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { ScrollView } from 'react-native-gesture-handler'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { KeyboardAvoidingView, RefreshControl, View } from 'react-native'
import { Button } from 'react-native-elements'
import _ from 'lodash'
import { DdRum, ErrorSource } from '@datadog/mobile-react-native'
import { ConversationsStackParamList } from '../../../types/types'
import { useCurrentAffiliation } from '../../../redux/hooks'
import { ConversationFeedVariables } from '../../../types/interfaces'
import { ConversationResponse, GET_CONVERSATION } from '../../../data/queries/conversations/conversation'
import { ConversationPlaceholder } from './Placeholder'
import { isIOS } from '../../helpers/device'
import { ConversationPost } from './ConversationPost'
import { Conversation } from '../../../data/queries/conversations/types'
import { Text } from '../Text'
import { globalStyles } from '../../../styles/global-stylesheet'
import { Colors } from '../../../styles/colors'
import { ConversationsContext, ConversationsContextStructure } from '../../helpers/contexts'
import { useAffiliationYearRange } from '../../hooks'

type Props = NativeStackScreenProps<ConversationsStackParamList, '_conversation'>

export const ConversationContent = ({ route, navigation }: Props) => {
  const params = route.params
  const { id, shouldFocusComments, newContent, focusedCommentId } = params
  const [isRefreshing, setIsRefreshing] = useState(false)
  const currentAffiliation = useCurrentAffiliation();
  const { end: endYear } = useAffiliationYearRange();
  const { schoolId } = currentAffiliation;
  const scrollView = useRef<ScrollView>()
  const [ isContentFocused, setIsContentFocussed ] = useState(false);
  const { scrollEnabled, setViewableId } = useContext(ConversationsContext) as ConversationsContextStructure;

  useEffect(() => {
    setViewableId(id);
  }, [])

  const defaultFeedVariables: ConversationFeedVariables = {
    gradYear: Number(endYear),
    schoolId: String(schoolId),
    limit: 10,
    offset: 0
  }

  const variables = {
    id
  }

  const { data, loading: isLoading, error, refetch } = useQuery<ConversationResponse>(GET_CONVERSATION, {
    variables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network'
  });

  const client = useApolloClient();
  useEffect(() => {
    if (data?.conversation.highlighted) {
      const cache = client.cache;
      const cachedId = cache.identify({
        __typename: 'Conversation',
        id: data?.conversation.id,
      });
      client.cache.modify({
        id: cachedId,
        fields: {
          highlighted: () => false,
        }
      });
    }
  }, [])

  const delay = (t: number) => {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  const navigateToConversations = () => {
    navigation.navigate('_feed');
  }

  const doRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      // using delay forces a minimum time
      // for the refresh. Sometimes refreshes
      // happen too fast. Making it feel like
      // nothing happenend
      delay(1000),
      refetch()
    ])
      .catch((error) =>
        DdRum.addError(
          error.message || 'error while refreshing single conversation screen',
          ErrorSource.SOURCE,
          error.stack || __filename,
          {
            error
          },
          Date.now()
        )
      )
      .finally(() => {
        setIsRefreshing(false)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let scrollContent: any;

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 15 }}>
        <ConversationPlaceholder />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={isIOS() ? { flex: 1, flexDirection: 'column',justifyContent: 'center' } : undefined}
      behavior="padding"
      enabled
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollView as Ref<ScrollView>}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={doRefresh}
          />
        }
        scrollIndicatorInsets={{ right: 1 }}
        scrollEnabled={scrollEnabled}
        onLayout={() => {
          if (scrollView.current) {
            scrollContent = _.debounce((params) => {
              setIsContentFocussed(true);
              return scrollView.current?.scrollTo(params);
            }, 300);
          }
        }}
      >
        {
          Boolean(data?.conversation) &&
          (
            <View
              style={{
                marginTop: 20
              }}
            >
              <ConversationPost conversation={data?.conversation as Conversation}
                showFirstCommentOnly={false}
                isCommentPaginationEnabled={true}
                isReplyPaginationEnabled={true}
                feedVariables={defaultFeedVariables}
                shouldFocusComments={shouldFocusComments}
                focusedCommentId={focusedCommentId}
                focusContent={(item, ref) => {
                  return ref.measure((x, y, width, height, px, py) => {
                    if (scrollContent && !isContentFocused) {
                      scrollContent({
                        y: (py - 100),
                        animated: true
                      })
                    }
                  })
                }}
                newContent={newContent}
              />
            </View>
          )
        }
        {
          Boolean(error) && <Text style={[globalStyles.boldText, {
              fontSize: 16,
              textAlign: 'center'
            }]}
          >Oops! We are having issues loading the conversation, try again later.</Text>
        }
        {
          !data?.conversation && <View
            style={{ flex: 1, backgroundColor: Colors.whiteRGBA(), borderRadius: 10, margin: 20, padding: 10 }}
          >
            <View style={{
              backgroundColor: Colors.grayTop,
              padding: 10,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10
            }}
            >
              <Text
                style={[globalStyles.boldText, {
                  textAlign: 'center',
                  fontSize: 18
                }]}
              >This content is no longer available</Text>
            </View>
            <View style={{
              backgroundColor: Colors.grayBottom,
              padding: 20,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10
            }}
            >
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 26
                }}
              >
                The content you requested cannot be displayed right now. It may be temporarily unavailable, the like you clicked on may have expired, or you may not have permission to view this page.
              </Text>
              <View
                style={{
                  flex: 1,
                  marginTop: 40,
                  alignSelf: 'flex-end',
                }}
              >
                <Button
                  title="OKAY"
                  containerStyle={[globalStyles.butonContainerPartialWidth, {
                    width: 'auto',
                  }]}
                  buttonStyle={[globalStyles.buttonStyle, {
                    paddingHorizontal: 30
                  }]}
                  titleStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      return navigation.goBack();
                    }
                    navigateToConversations();
                  }}
                />
              </View>
            </View>
          </View>
        }
      </ScrollView>
    </KeyboardAvoidingView>)
}
