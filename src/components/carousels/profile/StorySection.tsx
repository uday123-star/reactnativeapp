import { useQuery } from '@apollo/client'
import ReadMore from '@fawazahmed/react-native-read-more'
import React from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { STORIES, StoriesResponse } from '../../../../data/queries/people/stories'
import { Colors } from '../../../../styles/colors'
import { globalStyles } from '../../../../styles/global-stylesheet'
import { Story } from '../../../../types/interfaces'
import { hasRudeStory, hasVisibleStory } from '../../../helpers/story'

interface Props {
  owner: string
  wrapperStyle?: StyleProp<ViewStyle>
  children?: JSX.Element
}

export const StorySection = ({ owner, wrapperStyle = {}, children }: Props): JSX.Element => {
  const { data, loading: isLoading } = useQuery<StoriesResponse>(STORIES, {
    variables: {
      owner
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });
  const [shouldSeeWarning, setShouldSeeWarning] = React.useState(true);
  let story: Story|null = null;

  if (!isLoading && data) {
    story = data?.stories[0];
  }

  switch (true) {
    case isLoading:
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <ActivityIndicator
            color={Colors.cyan}
            style={{
              width: 40,
              height: 40
            }}
          />
        </View>
      )

    case story && hasRudeStory(story):
      return (
        <View style={wrapperStyle}>
          <Text style={titleText}>Story</Text>
          {shouldSeeWarning
            ? (
              <TouchableOpacity style={{
                  backgroundColor: Colors.blackRGBA(0.85),
                  borderRadius: 25,
                  padding: 20
                }}
                onPress={() => setShouldSeeWarning(false)}
                accessibilityLabel='Flagged content, continue reading'
                accessible={true}
                accessibilityRole='button'
              >
                <Text style={{ color: Colors.whiteRGBA(0.9), fontSize: 16, textAlign: 'center', fontWeight: 'bold', marginVertical: 20 }}>This content has been flagged{'\n'}and may be inappropriate.</Text>
                <Text
                  style={[globalStyles.linkColor, globalStyles.boldText ,{ fontSize: 16, textAlign: 'center', marginBottom: 20 }]}
                  accessible={true}
                  accessibilityLabel='Continue reading'
                  accessibilityRole='text'
                >Continue reading</Text>
              </TouchableOpacity>
            )

            : (
              <View style={storyBubble}>
                <Text
                  accessibilityRole='text'
                  accessibilityLabel='User story'
                  style={storyContent}
                >{story?.text.trim()}</Text>
                <Text
                  style={hideContent}
                  onPress={() => setShouldSeeWarning(true)}
                >
                  Hide content
                </Text>
              </View>
            )
          }
          {children}
        </View>
      )

    case story && hasVisibleStory(story):
      return (
        <View style={wrapperStyle}>
          <Text style={titleText}>Story</Text>
          <View style={storyBubble}>
            <ReadMore
              numberOfLines={3}
              seeMoreStyle={{ color: Colors.darkCyan }}
              seeLessStyle={{ color: Colors.darkCyan }}
              animate={false}
              seeMoreContainerStyleSecondary={{}}
              style={storyContent}
            >
              {story?.text.trim()}
            </ReadMore>
          </View>
          {children}
        </View>
      )
    default:
      return (<View />);
  }
}

const { hideContent, storyContent, storyBubble, titleText } = StyleSheet.create({
  titleText: {
    ...globalStyles.sectionHeaderText,
    paddingBottom: 10
  },
  hideContent: {
    ...globalStyles.linkColor,
    fontSize: 16,
  },
  storyContent: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    paddingBottom: 20,
  },
  storyBubble: {
    padding: 10,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 10,
  }
})
