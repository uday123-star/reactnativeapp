import * as Analytics from 'expo-firebase-analytics';
import store from '../../redux/store';
import { APP_ENV } from '../adapters/configuration';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const logEvent = (name: string, properties: Record<string, any> = {}) => {
  if (APP_ENV === 'PRODUCTION') {
    try {
      const currentUser = store.getState().myProfile.currentUser;
      const currentAffiliation = store.getState().currentAffiliation?.currentAffiliation;
      const eventProperties = {
        ...properties
      };
      for (const prop in eventProperties) {
        try {
          const valueType = typeof eventProperties[prop];
          const value = ['string', 'number'].includes(valueType) ? eventProperties[prop] : JSON.stringify(eventProperties[prop]);
          if (value.length <= 100)
            eventProperties[prop] = value;
          else
            delete eventProperties[prop];
        } catch (error) {
          continue;
        }
      }
      const event = {
        ...eventProperties,
        membership_state: currentUser.membershipState,
        registration_id: currentUser.id,
        primary_affiliation: currentUser.primaryAffiliation?.id,
        current_affiliation: currentAffiliation?.id,
        sales_program: String(currentUser.source),
        creation_date: currentUser.creationDate,
        grad_year: currentUser.primaryAffiliation?.gradYear,
      };
      Analytics.logEvent(name, event);
    } catch (error) {
      console.error(error);
    }
  }
}
