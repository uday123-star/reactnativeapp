import { RefreshTokenResponse, REFRESH_TOKEN } from '../../data/queries/user-data/renew-token';
import { buildAuthHeader } from '../../redux/slices/current-user/helpers';
import store from '../../redux/store';
import apolloClient from '../adapters/apollo-client.adapter';
import { getDeviceId } from '../helpers/device';

let MUTATION: Promise<RefreshTokenResponse | null> | null;
export const getMutation = (isGettingNewToken: boolean): Promise<RefreshTokenResponse | null> | null => {
  if (!isGettingNewToken) {
    MUTATION = null;
    MUTATION = new Promise((resolve,reject)=>{
      getDeviceId().then((deviceId) => {
        const {
          refreshToken = '',
        } = store.getState().currentUser;
        const authHeader = buildAuthHeader(refreshToken);
        apolloClient.mutate<Promise<RefreshTokenResponse>>({
          mutation: REFRESH_TOKEN,
          variables: { deviceId },
          context: {
            headers: authHeader
          },
        }).then(res=>{
          if (res.data) {
            return resolve(res.data);
          }
          return resolve(null);
        }).catch(reject)
      })
    })
  }
  return MUTATION;
}
