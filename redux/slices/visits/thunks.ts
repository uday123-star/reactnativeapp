import { createAsyncThunk } from '@reduxjs/toolkit'
import { AddVisitArgs, AddVisitResponse, ADD_VISIT } from '../../../data/queries/visits/add'
import { DeleteVisitsArgs, DELETE_VISIT } from '../../../data/queries/visits/delete'
import { UpdatedVisitsResponse, UpdateVisitArgs, UPDATE_VISIT } from '../../../data/queries/visits/update'
import Client from '../../../src/adapters/apollo-client.adapter'
import { logEvent } from '../../../src/helpers/analytics'
import { DeleteVisitsResponse, VisitsResponse, VisitTypeEnum } from '../../../types/interfaces'
import { isIOS } from '../../../src/helpers/device'

export const removeVisitThunk = createAsyncThunk(
  'visits/deleteVisit',
  async ({
    visitId,
    visiteeId
  }: DeleteVisitsArgs) => {
    try {
      const response = await Client.mutate<DeleteVisitsResponse>({
        mutation: DELETE_VISIT,
        variables: { visitId: String(visitId), visiteeId: String(visiteeId) }
      });

      return response.data;

    } catch (e) {
      console.error('error while deleting a visit :: ', e);
      return;
    }
  }
)

const logVisit = (visit: VisitsResponse, type: 'ADD'|'UPDATE') => {
  const { normal, anonymous, deleted, permanent } = VisitTypeEnum;
  const { visitType, visitorId, visiteeId, visitOrigin } = visit;

  const visitEvent = {
    visitorId,
    visiteeId,
    visitId: visit.id,
    originName: visitOrigin,
    isAnonymous: visitType === anonymous,
  };
  if (type === 'ADD') {
    if ([normal, anonymous].includes(visitType)) {
      logEvent('guestbook_signature', visitEvent);
    }
  } else if (visitType !== deleted && visitType !== permanent) {
    logEvent('guestbook_signature', visitEvent);
  }
}

const getDeviceOS = () => {
  return isIOS() ? 'ios' : 'android';
}

export const addVisitThunk = createAsyncThunk(
  'visits/addVisit',
  async ({ visiteeId, visitOrigin }: AddVisitArgs, { rejectWithValue }) => {
    try {
      const OS = getDeviceOS();
      const { data } = await Client.mutate<AddVisitResponse>({
        mutation: ADD_VISIT,
        variables: { visiteeId: String(visiteeId), visitOrigin: `${visitOrigin}:${OS}` }
      });

      if (data) {
        const { addVisit } = data;

        if (addVisit && addVisit.shouldLogEvent) {
          logVisit(data?.addVisit, 'ADD');
        }

        return addVisit;
      }

      return null;
    } catch (e) {
      console.error('error while logging a visit :: ', e);
      return rejectWithValue(e);
    }
  }
)

export const updateVisitThunk = createAsyncThunk(
  'visits/updateVisit',
  async ({ visitId, visitType, visiteeId }: UpdateVisitArgs, { rejectWithValue }) => {
    try {
      const { data } = await Client.mutate<UpdatedVisitsResponse>({
        mutation: UPDATE_VISIT,
        variables: { visitId: String(visitId), visitType, visiteeId }
      });

      if (data) {
        const { updateVisit } = data;

        if (updateVisit && updateVisit.shouldLogEvent) {
          logVisit(updateVisit, 'UPDATE');
        }

        return updateVisit;
      }

      return null;
    } catch (e) {
      console.error('error while updating a visit', e);
      return rejectWithValue(e);
    }
  }
)
