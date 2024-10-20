import { gql } from '@apollo/client'
import { QUERY_PREFIX } from '../constants'

export interface FetchAllCitiesArgs {
  state: string
}

export interface City {
  id: string
  name: string
  stateId: string
}

export interface FetchAllCitiesResponse {
  cities: City[]
}

export const FETCH_ALL_CITIES = gql`
query ${QUERY_PREFIX}fetchCity($state:ID!) {
  cities(state: $state,limit: 0) {
		id
    name
    stateId
  }
}
`
