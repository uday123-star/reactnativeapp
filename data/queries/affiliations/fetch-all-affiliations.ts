import { gql } from '@apollo/client';
import { AffiliationModel } from '../../../types/interfaces';
import { QUERY_PREFIX } from '../constants';
import { AFFILIATION_FIELDS } from './common';

// TODO : This should supercede the existing AffiliationModel
export interface Affiliation extends AffiliationModel {
  id: string
  firstName: string
  lastName: string
  schoolId: string
  schoolName: string
  startYear: string
  endYear: string
  gradYear: string
  schoolCity: string
  schoolState: string
  primary: boolean
}

export interface Affiliations {
  affiliations: Affiliation[]
}

export const FETCH_ALL_AFFILIATIONS = gql`
query ${QUERY_PREFIX}fetchAllAffiliationThunk {
  affiliations {
    ${AFFILIATION_FIELDS}
  }
}
`;

