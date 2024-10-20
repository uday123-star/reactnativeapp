import { ReactionPostingType } from '../../../data/queries/conversations/add_reaction';
import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types';

export const usePostingType = (content: Conversation | Comment | Reply): ReactionPostingType => {
  return content.__typename.toUpperCase() as ReactionPostingType;
}
