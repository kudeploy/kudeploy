jest.mock('@nest-boot/auth', () => ({
  BaseUser: class BaseUser {},
}));

jest.mock('@nest-boot/graphql-connection', () => ({
  ConnectionBuilder: class ConnectionBuilder {
    addField() {
      return this;
    }

    build() {
      return {
        Connection: class Connection {},
        ConnectionArgs: class ConnectionArgs {},
      };
    }
  },
  ConnectionManager: class ConnectionManager {},
}));

import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceMemberRole } from '@/app/workspace-member/enums/workspace-member-role.enum';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberService } from '@/app/workspace-member/workspace-member.service';

import { ApiKey } from './api-key.entity';
import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyResolver', () => {
  it('returns null for missing API keys', async () => {
    const { resolver, apiKeyService } = createResolver({
      apiKeyService: {
        findOne: jest.fn(async () => null),
      },
    });

    await expect(
      resolver.apiKey('api_key_1', { id: 'member_1' } as WorkspaceMember),
    ).resolves.toBeNull();

    expect(apiKeyService.findOne).toHaveBeenCalledWith({ id: 'api_key_1' });
  });

  it('rejects access to other members API keys for regular members', async () => {
    const apiKey = createApiKeyForMember({ id: 'member_2' });
    const { resolver } = createResolver({
      apiKeyService: {
        findOne: jest.fn(async () => apiKey),
      },
    });

    await expect(
      resolver.apiKey('api_key_1', {
        id: 'member_1',
        role: WorkspaceMemberRole.MEMBER,
      } as WorkspaceMember),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists all workspace API keys for owners and only own keys for regular members', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const owner = {
      id: 'owner_1',
      role: WorkspaceMemberRole.OWNER,
    } as WorkspaceMember;
    const member = {
      id: 'member_1',
      role: WorkspaceMemberRole.MEMBER,
    } as WorkspaceMember;
    const args = { first: 10 } as never;
    const { resolver, cm } = createResolver();

    await resolver.apiKeys(args, workspace, owner);
    await resolver.apiKeys(args, workspace, member);

    expect(cm.find).toHaveBeenNthCalledWith(1, expect.any(Function), args, {
      where: {
        workspace,
      },
    });
    expect(cm.find).toHaveBeenNthCalledWith(2, expect.any(Function), args, {
      where: {
        workspace,
        member,
      },
    });
  });

  it('creates API keys for the current member by default', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const currentMember = {
      id: 'member_1',
      role: WorkspaceMemberRole.MEMBER,
    } as WorkspaceMember;
    const result = {
      entity: { id: 'api_key_1' } as ApiKey,
      apiKey: 'sk-0123456789abcdefabcdef0123456789',
    };
    const { resolver, apiKeyService, workspaceMemberService } = createResolver({
      apiKeyService: {
        createKey: jest.fn(async () => result),
      },
    });

    await expect(
      resolver.createApiKey({ name: 'Deploy key' }, workspace, currentMember),
    ).resolves.toBe(result);

    expect(workspaceMemberService.findOneOrFail).not.toHaveBeenCalled();
    expect(apiKeyService.createKey).toHaveBeenCalledWith(currentMember, {
      name: 'Deploy key',
      expiresAt: null,
    });
  });

  it('allows owners to create API keys for other members', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const targetMember = { id: 'member_2' } as WorkspaceMember;
    const { resolver, workspaceMemberService, apiKeyService } = createResolver({
      workspaceMemberService: {
        findOneOrFail: jest.fn(async () => targetMember),
      },
      apiKeyService: {
        createKey: jest.fn(async () => ({
          entity: { id: 'api_key_1' } as ApiKey,
          apiKey: 'sk-0123456789abcdefabcdef0123456789',
        })),
      },
    });

    await resolver.createApiKey(
      {
        name: 'Deploy key',
        workspaceMemberId: 'member_2',
      },
      workspace,
      {
        id: 'owner_1',
        role: WorkspaceMemberRole.OWNER,
      } as WorkspaceMember,
    );

    expect(workspaceMemberService.findOneOrFail).toHaveBeenCalledWith({
      id: 'member_2',
      workspace,
    });
    expect(apiKeyService.createKey).toHaveBeenCalledWith(targetMember, {
      name: 'Deploy key',
      expiresAt: null,
    });
  });

  it('rejects creating API keys for other members without manage role', async () => {
    const { resolver, apiKeyService } = createResolver();

    await expect(
      resolver.createApiKey(
        {
          name: 'Deploy key',
          workspaceMemberId: 'member_2',
        },
        { id: 'workspace_1' } as Workspace,
        {
          id: 'member_1',
          role: WorkspaceMemberRole.MEMBER,
        } as WorkspaceMember,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(apiKeyService.createKey).not.toHaveBeenCalled();
  });

  it('throws not found when updating missing API keys', async () => {
    const { resolver } = createResolver({
      apiKeyService: {
        findOne: jest.fn(async () => null),
      },
    });

    await expect(
      resolver.updateApiKey('api_key_1', { name: 'New' }, {
        id: 'member_1',
      } as WorkspaceMember),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates accessible API keys', async () => {
    const apiKey = createApiKeyForMember({ id: 'member_1' });
    const { resolver, apiKeyService } = createResolver({
      apiKeyService: {
        findOne: jest.fn(async () => apiKey),
        updateName: jest.fn(async () => apiKey),
      },
    });

    await expect(
      resolver.updateApiKey('api_key_1', { name: 'New' }, {
        id: 'member_1',
        role: WorkspaceMemberRole.MEMBER,
      } as WorkspaceMember),
    ).resolves.toBe(apiKey);

    expect(apiKeyService.updateName).toHaveBeenCalledWith(apiKey, 'New');
  });

  it('deletes accessible API keys', async () => {
    const apiKey = createApiKeyForMember({ id: 'member_1' });
    const { resolver, apiKeyService } = createResolver({
      apiKeyService: {
        findOne: jest.fn(async () => apiKey),
        remove: jest.fn(async () => apiKey),
      },
    });

    await expect(
      resolver.deleteApiKey('api_key_1', {
        id: 'member_1',
        role: WorkspaceMemberRole.MEMBER,
      } as WorkspaceMember),
    ).resolves.toBe(apiKey);

    expect(apiKeyService.remove).toHaveBeenCalledWith(apiKey);
  });

  it('loads API key member field', async () => {
    const member = { id: 'member_1' } as WorkspaceMember;
    const { resolver } = createResolver();

    await expect(resolver.member(createApiKeyForMember(member))).resolves.toBe(
      member,
    );
  });
});

function createResolver(overrides?: {
  apiKeyService?: Partial<ApiKeyService>;
  workspaceMemberService?: Partial<WorkspaceMemberService>;
  cm?: { find: jest.Mock };
}) {
  const apiKeyService = {
    findOne: jest.fn(),
    createKey: jest.fn(),
    updateName: jest.fn(),
    remove: jest.fn(),
    ...overrides?.apiKeyService,
  } as unknown as jest.Mocked<ApiKeyService>;
  const workspaceMemberService = {
    findOneOrFail: jest.fn(),
    ...overrides?.workspaceMemberService,
  } as unknown as jest.Mocked<WorkspaceMemberService>;
  const cm = overrides?.cm ?? { find: jest.fn() };
  const resolver = new ApiKeyResolver(
    apiKeyService,
    workspaceMemberService,
    cm as never,
  );

  return {
    resolver,
    apiKeyService,
    workspaceMemberService,
    cm,
  };
}

function createApiKeyForMember(member: Partial<WorkspaceMember>): ApiKey {
  return {
    id: 'api_key_1',
    member: {
      loadOrFail: jest.fn(async () => member),
    },
  } as unknown as ApiKey;
}
