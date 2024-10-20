import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'

export interface State {
  id: string
  abbreviation: string
  name: string
}

export interface FetchAllStatesResponse {
  states: State[]
}

export const FETCH_ALL_STATES = gql`
query ${QUERY_PREFIX}fetchStates {
  states {
    id
    abbreviation
    name
  }
}
`
