import { HttpLink } from '@apollo/client';
import { API_URL } from '../../adapters/configuration';

export const customFetch = (uri: RequestInfo, options: RequestInit) => {
  return fetch(uri, options)
  .then(response => {
    if (response.status >= 500) {
      return Promise.reject(response.status)
    }
    return response;
  });
}

export const httpLink = new HttpLink({ uri: API_URL, fetch: customFetch });

