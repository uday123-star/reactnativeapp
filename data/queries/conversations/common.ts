import { AFFILIATION_DETAILS_FIELDS } from '../affiliations/common';

export const COMMENT_FIELDS = `
  id
  conversation_id
  posted_by {
    name
    photo
    registration_id
    affiliation {
      ${AFFILIATION_DETAILS_FIELDS}
    }
  }
  school {
    name
    year
    id
  }
  replies_count
  creation_date
  display_state
  message {
    text
    entityRanges {
      entity {
        data
        mention_id
        type
      }
      length
      offset
    }
  }
  reactions_count{
    likes_count
    hearts_count
    smiles_count
    reactions_count
  }
`;

export const CONVERSATION_FIELDS = `
  id
  posted_by {
    name
    photo
    registration_id
    affiliation {
      ${AFFILIATION_DETAILS_FIELDS}
    }
  }
  message {
    text
    entityRanges {
      entity {
        data
        mention_id
        type
      }
      length
      offset
    }
  }
  school {
    id
    name
    year
  }
  comments_count
  creation_date
  display_state
  reactions_count{
    likes_count
    hearts_count
    smiles_count
    reactions_count
  }
  myFollow {
    id
  }
  highlighted @client
`;

export const REPLY_FIELDS = `
  id
  posted_by {
    registration_id
    name
    photo
    affiliation {
      ${AFFILIATION_DETAILS_FIELDS}
    }
  }
  school {
    id
    name
    year
  }
  message {
    text
    entityRanges {
      entity {
        data
        mention_id
        type
      }
      length
      offset
    }
  }
  creation_date
  comment_id
  reactions_count{
    likes_count
    hearts_count
    smiles_count
    reactions_count
  }
`

export const REACTION_FIELDS = `
  id
`
