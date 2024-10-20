/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Observable } from '@apollo/client/utilities';
import { FetchResult, NextLink, Operation } from '@apollo/client/core'
import { ErrorResponse, onError } from '@apollo/client/link/error';
import store from '../../../redux/store';
import { RefreshTokenResponse } from '../../../data/queries/user-data/renew-token';
import { setCurrentUserState } from '../../../redux/slices/current-user/slice';
import { refreshAccessToken } from '../../../redux/slices/refresh-token/thunks';
import { dataDogStartAction, dataDogStopAction } from '../../helpers/datadog';
import { RumActionType } from '@datadog/mobile-react-native';
import * as Network from 'expo-network';

const validateNetworkError = (retry = false, forward?: NextLink, operation?: Operation): Observable<FetchResult> | void => {
  return new Observable((observer) => {
    Network.getNetworkStateAsync()
    .then((networkState) => {
      if (networkState.isInternetReachable) {
        if (retry && forward && operation) {
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          };

          // Retry last failed request
          forward(operation).subscribe(subscriber);
        }
        return observer.complete();
      }
      observer.error({
        message: 'Your internet connection seems to be unavailable please reconnect and try again'
      })
    })
    .then(() => {
      dataDogStopAction();
    })
    .catch((error) => {
      dataDogStopAction({ error })
      observer.error(error);
    })
  });
}

export const errorLink = onError(
  ({
    graphQLErrors,
    networkError,
    operation,
    forward
  }: ErrorResponse): Observable<FetchResult> | void => {
    if (graphQLErrors) {
      const isUnauthorized = Boolean(graphQLErrors.find((obj: any) => obj.extensions.response?.statusCode === 401));
      if (isUnauthorized) {
        dataDogStartAction(RumActionType.CUSTOM, 'token renewal')
        return new Observable((observer) => {
          store.dispatch(<any>refreshAccessToken()).unwrap().then((response: RefreshTokenResponse) => {
            const {
              refresh: {
                accessToken,
                accessTokenExp,
              }
            } = response;
            store.dispatch(setCurrentUserState({
              accessToken,
              accessTokenExp
            }));
            operation.setContext(({ headers = {}}) => ({
              headers: {
                // Re-add old headers
                ...headers,
                // Switch out old access token for new one
                authorization: `Bearer ${accessToken}` || null,
              }
            }));
          }).then(() => {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            };

            // Retry last failed request
            forward(operation).subscribe(subscriber);
          }).then(() => {
            dataDogStopAction();
          }).catch((error: any) => {
            dataDogStopAction({ error })
            observer.error(error);
          })
        })
      }
    }
    if (networkError) {
      return validateNetworkError(true, forward, operation);
    }
  }
);
