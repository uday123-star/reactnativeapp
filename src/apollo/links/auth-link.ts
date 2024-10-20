import store from '../../../redux/store';
import { buildAuthHeader } from '../../../redux/slices/current-user/helpers';
import { ApolloLink } from '@apollo/client';

export const authLink = new ApolloLink((operation, forward) => {

  const { accessToken = '' } = store.getState().currentUser;
  const authHeader = buildAuthHeader(accessToken);

  operation.setContext(({ headers = {}}) => ({
    headers: {
      ...headers,
      ...authHeader,
    }
  }))

  return forward(operation);
});
