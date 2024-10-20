/* eslint-disable  @typescript-eslint/no-explicit-any */
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { FetchResult } from '@apollo/client/core'
import { ErrorResponse, onError } from '@apollo/client/link/error';
import store from '../../store';
import { buildAuthHeader } from '../current-user/helpers';
import { signOut } from '../current-user/slice';
import { API_URL } from '../../../src/adapters/configuration';
import { customFetch } from '../../../src/apollo/links/http-link';

const httpLink = new HttpLink({ uri: API_URL, fetch: customFetch });

const authLink = new ApolloLink((operation, forward) => {
  const {
    refreshToken = '',
  } = store.getState().currentUser;

  const authHeader = buildAuthHeader(refreshToken);

  operation.setContext(({ headers = {}}) => ({
    headers: {
      ...headers,
      ...authHeader,
    }
  }))

  return forward(operation);
});

const errorLink = onError(
  ({
    graphQLErrors
  }: ErrorResponse): Observable<FetchResult> | void => {
    if (graphQLErrors) {
      const isUnauthorized = Boolean(graphQLErrors.find((obj: any) => obj.extensions.response?.statusCode === 401));
      if (isUnauthorized) {
        store.dispatch(signOut({
          refreshTokenExpired: true,
        }));
      }
    }
  }
);

export const links = ApolloLink.from([
  authLink,
  errorLink,
  httpLink,
]);


export const refreshClient = new ApolloClient({
  link: links,
  cache: new InMemoryCache({ resultCaching: false }),
  defaultOptions: {
    mutate: { errorPolicy: 'none' }
  }
});
