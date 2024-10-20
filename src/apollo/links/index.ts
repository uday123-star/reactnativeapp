import { ApolloLink } from '@apollo/client'
import { authLink } from './auth-link'
import { cancelLink } from './cancel-link'
import { errorLink } from './error-link'
import { httpLink } from './http-link'
import { timeoutLink } from './timeout-link'

export const links = ApolloLink.from([
  cancelLink,
  timeoutLink,
  authLink,
  errorLink,
  httpLink,
]);

export default links;
