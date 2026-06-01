import { RequestContext } from '@nest-boot/request-context';
import { Request, Response } from 'express';

import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';

import { ApiKey } from './api-key.entity';
import { ApiKeyMiddleware } from './api-key.middleware';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyMiddleware', () => {
  it('does nothing when the request does not contain an API key', async () => {
    const { middleware, apiKeyService } = createMiddleware();
    const next = jest.fn();

    await RequestContext.run(new RequestContext({ type: 'http' }), async () => {
      await middleware.use(createRequest(), createResponse(), next);

      expect(RequestContext.get(WorkspaceMember)).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    expect(apiKeyService.validate).not.toHaveBeenCalled();
  });

  it('sets workspace context from the API key binding', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const apiKey = {
      id: 'api_key_1',
    } as ApiKey;
    const workspaceMember = {
      id: 'member_1',
      workspace,
    } as unknown as WorkspaceMember;
    const { middleware, apiKeyService } = createMiddleware({
      validate: jest.fn(async () => ({
        apiKey,
        workspace,
        workspaceMember,
      })),
    });
    const next = jest.fn();

    await RequestContext.run(new RequestContext({ type: 'http' }), async () => {
      await middleware.use(
        createRequest({
          authorization: 'Bearer sk-0123456789abcdefabcdef0123456789',
        }),
        createResponse(),
        next,
      );

      expect(RequestContext.get(ApiKey)).toBe(apiKey);
      expect(RequestContext.get(WorkspaceMember)).toBe(workspaceMember);
      expect(RequestContext.get(Workspace)).toBe(workspace);
      expect(next).toHaveBeenCalledWith();
    });

    expect(apiKeyService.validate).toHaveBeenCalledWith(
      'sk-0123456789abcdefabcdef0123456789',
    );
  });

  it('overrides selected workspace context with the API key workspace', async () => {
    const selectedWorkspace = { id: 'workspace_1' } as Workspace;
    const apiKeyWorkspace = { id: 'workspace_2' } as Workspace;
    const workspaceMember = {
      id: 'member_1',
      workspace: apiKeyWorkspace,
    } as unknown as WorkspaceMember;
    const { middleware, apiKeyService } = createMiddleware({
      validate: jest.fn(async () => ({
        apiKey: {
          id: 'api_key_1',
        },
        workspace: apiKeyWorkspace,
        workspaceMember,
      })),
    });
    const next = jest.fn();

    await RequestContext.run(new RequestContext({ type: 'http' }), async () => {
      RequestContext.set(Workspace, selectedWorkspace);

      await middleware.use(
        createRequest({
          'x-api-key': 'sk-0123456789abcdefabcdef0123456789',
        }),
        createResponse(),
        next,
      );

      expect(RequestContext.get(Workspace)).toBe(apiKeyWorkspace);
      expect(RequestContext.get(WorkspaceMember)).toBe(workspaceMember);
      expect(next).toHaveBeenCalledWith();
    });

    expect(apiKeyService.validate).toHaveBeenCalledWith(
      'sk-0123456789abcdefabcdef0123456789',
    );
  });
});

function createMiddleware(
  overrides: {
    validate?: jest.Mock;
  } = {},
) {
  const apiKeyService = {
    validate: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<ApiKeyService>;

  return {
    apiKeyService,
    middleware: new ApiKeyMiddleware(apiKeyService),
  };
}

function createRequest(headers: Record<string, unknown> = {}) {
  return {
    headers,
  } as Request;
}

function createResponse() {
  return {} as Response;
}
