import { gql } from '@apollo/client';
import { QUERY_PREFIX } from '../constants';

export enum ReportedEntityContextType {
  PERSON = 'PERSON',
  YEARBOOKPAGE = 'YEARBOOKPAGE',
  COMMENT = 'COMMENT',
  EVENT = 'EVENT',
  CLASS_REUNION_DEFAULT = 'CLASS_REUNION_DEFAULT',
}

export interface ReportedEntityContext {
  id: string
  type?: ReportedEntityContextType
  year?: string
  url?: string
  category?: string
}

export enum ReportedEntityType {
  PERSONAL_MESSAGE = 'PERSONAL_MESSAGE',
  PROFILE = 'PROFILE',
  COMMENT = 'COMMENT',
  NOTE = 'NOTE',
  PHOTO = 'PHOTO',
  /**
   * Conversation types: This types are been used for making a distinction between conversations and other content types.
   * A different implementation is required for conversations, calling different endpoints from the graphql api.
   */
  CONVERSATION = 'CONVERSATION',
  CONVERSATION_COMMENT = 'CONVERSATION_COMMENT',
  CONVERSATION_REPLY = 'CONVERSATION_REPLY',
}

export interface ReportInput {
  reportedEntityId: string
  reporterId: string
  reportedEntityType: ReportedEntityType
  reportedEntityText?: string
  entityContext?: ReportedEntityContext
  parent?: ReportedEntityContext
  reporterComment?: string
}

export const REPORT_ENTITY = gql`
mutation ${QUERY_PREFIX}sendReport(
  $reportedEntityId: ID!,
  $reporterId: ID!,
  $reportedEntityType: ReportedEntityType!,
  $entityContext: EntityContextArgs!,
  $reportedEntityText: String,
  $parent: EntityContextArgs,
  $reporterComment: String
){
  addReport(
    reportedEntityId: $reportedEntityId,
    reporterId: $reporterId,
    reportedEntityType: $reportedEntityType,
    reportedEntityText: $reportedEntityText,
    entityContext: $entityContext,
    parent: $parent,
    reporterComment: $reporterComment
  )
}`;


