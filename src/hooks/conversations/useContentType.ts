import { Comment, Conversation, Reply } from '../../../data/queries/conversations/types';

export const useContentType = (content: Conversation | Comment | Reply): 'Conversation' | 'Comment' | 'Reply' => {
  return content.__typename;
}
