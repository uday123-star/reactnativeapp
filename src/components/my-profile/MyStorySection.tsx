import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { Button } from '../Button'
import { globalStyles } from '../../../styles/global-stylesheet'
import ReadMore from '@fawazahmed/react-native-read-more'
import { Colors } from '../../../styles/colors'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Placeholder, Fade, PlaceholderLine } from 'rn-placeholder'
import { dataDogStartAction } from '../../helpers/datadog'
import { DdRum, ErrorSource, RumActionType } from '@datadog/mobile-react-native'
import { CurrentUser, Story } from '../../../types/interfaces'
import { useMutation } from '@apollo/client'
import { AddStoryArgs, AddStoryResponse, ADD_STORY } from '../../../data/queries/my-profile/add-story'
import { DeleteMyStoryResponse, DELETE_MY_STORY } from '../../../data/queries/my-profile/delete-story'
import { UpdateStoryArgs, UpdateStoryResponse, UPDATE_MY_STORY } from '../../../data/queries/my-profile/update-story'
import BasicAlert from '../BasicAlert'
import { hasRudeStory } from '../../helpers/story'

interface Props {
  currentUser: CurrentUser
}

export const MyStorySection = ({ currentUser }: Props) => {
  const { stories = []} = currentUser;
  const story: Story | null = stories.length ? stories[0] : null;

  const isEmpty = !story || !story?.text;
  const isRude = story ? hasRudeStory(story) : false;

  const [ draft, setDraft ] = useState(story?.text || '');
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ addStory, { loading: loadingAddStory, error: errorAddStory } ] = useMutation<AddStoryResponse>(ADD_STORY);
  const [ deleteStory, { loading: loadingDelStory, error: errorDelStory } ] = useMutation<DeleteMyStoryResponse>(DELETE_MY_STORY);
  const [ updateStory, { loading: loadingUpdStory, error: errorUpdStory } ] = useMutation<UpdateStoryResponse>(UPDATE_MY_STORY);

  useEffect(() => {
    if (errorAddStory) {
      BasicAlert.show({
        title: 'Stories',
        text: errorAddStory.message || 'Oops! Sorry, there was a problem adding your story, try again later.'
      })
    }
  }, [errorAddStory])

  useEffect(() => {
    if (errorDelStory) {
      BasicAlert.show({
        title: 'Stories',
        text: errorDelStory.message || 'Oops! Sorry, there was a problem deleting your story, try again later.'
      })
    }
  }, [errorDelStory])

  useEffect(() => {
    if (errorUpdStory) {
      BasicAlert.show({
        title: 'Stories',
        text: errorUpdStory.message || 'Oops! Sorry, there was a problem updating your story, try again later.'
      })
    }
  }, [errorUpdStory])

  useEffect(() => {
    if (loadingAddStory || loadingDelStory || loadingUpdStory) {
      setIsLoading(true)
    } else {
      setIsLoading(false);
    }
  }, [loadingAddStory, loadingDelStory, loadingUpdStory])

  const _submitStory = () => {
    const { TAP } = RumActionType;
    dataDogStartAction(TAP, 'saving story', { draft, id: story?.id })
    if (!story) {
      const variables: AddStoryArgs = {
        text: draft
      }
      return addStory({
        variables,
        update: (cache, { data }) => {
          const cachedId = cache.identify({
            __typename: 'Person',
            id: currentUser.id
          });
          cache.modify({
            id: cachedId,
            fields: {
              stories: () => [data?.addStory],
            }
          })
        },
        onError: (error) => {
          DdRum.addError(
            error.message || 'There was an error adding a story',
            ErrorSource.SOURCE,
            error.stack || __filename,
            {
              error,
              variables
            },
            Date.now()
          )
        }
      }).then(() => setIsEditing(false))
    }
    if (!draft) {
      return deleteStory({
        variables: {
          id: story.id
        },
        update: (cache) => {
          const cachedId = cache.identify({
            __typename: 'Person',
            id: currentUser.id
          });
          cache.modify({
            id: cachedId,
            fields: {
              stories: () => [],
            }
          })
        },
        onError: (error) => {
          DdRum.addError(
            error.message || 'There was an error deleting a story',
            ErrorSource.SOURCE,
            error.stack || __filename,
            {
              error,
              variables: {
                id: story.id
              }
            },
            Date.now()
          )
        }
      }).then(() => setIsEditing(false))
    }

    if (hasChangedText(draft, story.text)) {
      const variables: UpdateStoryArgs = {
        id: story.id,
        text: draft
      };
      return updateStory({
        variables,
        update: (cache, { data }) => {
          const cachedId = cache.identify({
            __typename: 'Person',
            id: currentUser.id
          });
          cache.modify({
            id: cachedId,
            fields: {
              stories: () => [data?.updateStory],
            }
          })
        },
        onError: (error) => {
          DdRum.addError(
            error.message || 'There was an error updating a story',
            ErrorSource.SOURCE,
            error.stack || __filename,
            {
              error,
              variables
            },
            Date.now()
          )
        }
      }).then(() => setIsEditing(false))
    } else {
      setIsEditing(false);
    }
  }

  const hasChangedText = (newText: string, oldText: string) => {
    return newText !== oldText;
  }

  if (isLoading) {
    return (
      <Placeholder
        Animation={Fade}
      >
        <PlaceholderLine />
        <PlaceholderLine />
        <PlaceholderLine style={{ width: '80%' }} />
      </Placeholder>
    );
  }

  if (isEmpty && !isEditing) {
    return (
      <View>
        <Button
          title="ADD A STORY"
          onPress={() => setIsEditing(true)}
          accessibilityLabel="Add a story"
          accessible={true}
        />
      </View>
    )
  } else {
    if (isEditing) {
      return (
        <View>
          <Text style={globalStyles.sectionHeaderText}>Story</Text>
          <ScrollView
            keyboardShouldPersistTaps="never"
            scrollIndicatorInsets={{ right: 1 }}
          >
            <TextInput
              style={{ padding: 15, marginVertical: 15, backgroundColor: Colors.textInputGray, height: 220 }}
              autoFocus={true}
              multiline={true}
              numberOfLines={8}
              value={draft}
              onBlur={_submitStory}
              onChangeText={text => setDraft(text)}
              accessible={true}
              accessibilityRole='text'
              accessibilityLabel='Edit your Story'
            />
          </ScrollView>
        </View>
      )
    } else {
      return (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={[globalStyles.sectionHeaderText, { marginRight: 10 }]}>Story</Text>
            <Icon
              name="pencil-square-o"
              color={Colors.darkCyan}
              onPress={() => setIsEditing(true)}
              size={18}
              accessible={true}
              accessibilityRole='button'
              accessibilityLabel='Edit your Story'
            />
          </View>
          {isRude && (
            <View style={{ backgroundColor: Colors.darkCyan, borderRadius: 25, padding: 20, marginVertical: 20 }}>
              <Text style={[globalStyles.boldText, { color: Colors.whiteRGBA() }]}>Your story has been hidden…</Text>
              <Text style={{ color: Colors.whiteRGBA(), fontSize: 16 }}>
                Please look it over and make sure you didn&apos;t include any website addresses, symbols, personal contact info, or inappropriate language. Edit those out and you should be able to post it normally.
              </Text>
            </View>
          )}
          <View>
            <View style={{ marginVertical: 10, padding: 20, backgroundColor: '#EAE9E9', borderRadius: 25 }}>
              <ReadMore
                accessibilityRole='text'
                accessibilityLabel='My Story'
                numberOfLines={3}
                seeMoreStyle={{ color: Colors.darkCyan }}
                seeLessStyle={{ color: Colors.darkCyan }}
                animate={false}
                seeMoreContainerStyleSecondary={{}}
                onPress={() => setIsEditing(true)}
              >
                {story?.text}
              </ReadMore>
            </View>
          </View>
        </View>
      )
    }
  }
}
