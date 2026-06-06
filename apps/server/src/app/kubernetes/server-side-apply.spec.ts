jest.mock('@kubernetes/client-node', () => ({
  PatchStrategy: {
    ServerSideApply: 'application/apply-patch+yaml',
  },
}));

import { PatchStrategy } from '@kubernetes/client-node';
import type { RequestContext } from '@kubernetes/client-node/dist/gen/http/http.js';

import { SERVER_SIDE_APPLY_OPTIONS } from './server-side-apply';

describe('SERVER_SIDE_APPLY_OPTIONS', () => {
  it('sets the server-side apply content type before sending a patch request', async () => {
    const setHeaderParam = jest.fn();
    const context = {
      setHeaderParam,
    } as unknown as RequestContext;

    const result =
      await SERVER_SIDE_APPLY_OPTIONS.middleware?.[0].pre(context).toPromise();

    expect(result).toBe(context);
    expect(setHeaderParam).toHaveBeenCalledWith(
      'Content-Type',
      PatchStrategy.ServerSideApply,
    );
  });
});
