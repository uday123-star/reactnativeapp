import { AffiliationDetails } from '../../../types/interfaces'

export interface AuthorInput {
  name: string
  photo: string
  registrationId: string
}

export interface Author {
  name: string
  photo: string
  registration_id: string
  affiliation: AffiliationDetails | null
}

export interface SchoolInput {
  id: string
  name: string
  year: number
}

export type School = SchoolInput

interface EntityRange {
  entity: {
    data: string
    mention_id: string
    type: string
  }
  length: number
  offset: number
}

export interface Message {
  text: string
  entityRanges: EntityRange[]
}

export interface Reaction {
  id: string
  // TODO: Add more fields
}

export interface ReactionsCount {
  likes_count: number
  hearts_count: number
  smiles_count: number
  reactions_count: number
}
interface ConversationContent {
  __typename: 'Reply' | 'Comment' | 'Post' | 'Conversation'
  id: string
  creation_date: Date
  posted_by: Author
  school: School
  display_state: number
  message: Message[]
  reactions_count: ReactionsCount
}

export interface Reply extends ConversationContent {
  comment_id: string
  likes_count: number
  last_update_date: Date
}

export interface Comment extends ConversationContent {
  conversation_id: string
  last_update_date: Date
  likes_count: number
  reactions: Reaction[]
  replies: Reply[]
  replies_count: number
}

export interface Conversation extends ConversationContent {
  comments_count: number
  myFollow: {
    id: string
  } | null
  highlighted?: boolean
}

export type Post = Conversation

export function isReply(content: ConversationContent): content is Reply {
  return content.__typename === 'Reply'
}

export function isComment(content: ConversationContent): content is Comment {
  return content.__typename === 'Comment'
}

export function isPost(content: ConversationContent): content is Post {
  return content.__typename === 'Conversation' || content.__typename === 'Post'
}
