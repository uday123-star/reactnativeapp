import { Story, StoryVisibleState } from '../../types/interfaces'

/**
 * Returns true if the story is rude or innapropriate
 * @param story
 * @returns boolean
 */
export const hasRudeStory = (story: Story): boolean => {
  const { RUDE, INAPPROPRIATE } = StoryVisibleState;
  return [RUDE, INAPPROPRIATE].includes(story.visibleState);
}

/**
 * Returns true if the story is visible
 * @param story
 * @returns boolean
 */
export const hasVisibleStory = (story: Story): boolean => {
  return story.visibleState === StoryVisibleState.VISIBLE;
}
