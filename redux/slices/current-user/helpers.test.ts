import { buildAuthHeader } from './helpers'

describe('helpers/auth header', () => {
  test('can build an auth header ', () => {
    const token = 'test';
    const authHeader = buildAuthHeader(token);
    expect(authHeader.Authorization).toBe('Bearer test');
  });
})
