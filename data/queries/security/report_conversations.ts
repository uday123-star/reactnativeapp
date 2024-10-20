import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export interface ReportConversationResponse {
  reportConversation: boolean
}

export interface ReportCommentResponse {
  reportComment: boolean
}

export interface ReportReplyResponse {
  reportReply: boolean
}

export const REPORT_CONVERSATION = gql`
  mutation ${QUERY_PREFIX}reportConversation($id: ID!) {
    reportConversation(id: $id)
  }
`;

export const REPORT_COMMENT = gql`
  mutation ${QUERY_PREFIX}reportComment($id: ID!) {
    reportComment(id: $id)
  }
`;

export const REPORT_REPLY = gql`
  mutation ${QUERY_PREFIX}reportReply($id: ID!) {
    reportReply(id: $id)
  }
`;
