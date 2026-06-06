jest.mock('@nest-boot/auth', () => ({
  BaseUser: class BaseUser {},
}));

import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@nest-boot/request-context';
import {
  RowLevelSecurity,
  RowLevelSecurityMode,
} from '@nest-boot/row-level-security';

import { User } from '@/app/user/user.entity';
import { WorkspaceMemberRole } from '@/app/workspace-member/enums/workspace-member-role.enum';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';

import { Workspace } from './workspace.entity';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a workspace and an owner member for the creator', async () => {
    const persisted: unknown[] = [];
    const em = {
      create: jest.fn((entity, data) => {
        expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.DISABLED);

        return { entity, ...data };
      }),
      persist: jest.fn((entity) => {
        persisted.push(entity);
        return em;
      }),
      flush: jest.fn(async () => {
        expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.DISABLED);
      }),
    } as unknown as EntityManager;
    const service = new WorkspaceService(em);
    const user = {
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
    } as User;

    let workspace: Workspace | undefined;

    await RequestContext.run(new RequestContext({ type: 'test' }), async () => {
      RowLevelSecurity.setMode(RowLevelSecurityMode.ENABLED);

      workspace = await service.createWorkspace(user, {
        name: 'Acme',
      });

      expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.ENABLED);
    });

    expect(em.create).toHaveBeenCalledWith(Workspace, { name: 'Acme' });
    expect(em.create).toHaveBeenCalledWith(
      WorkspaceMember,
      expect.objectContaining({
        workspace: workspace!,
        user,
        name: 'Alice',
        email: 'alice@example.com',
        role: WorkspaceMemberRole.OWNER,
      }),
    );
    expect(persisted).toHaveLength(2);
    expect(em.flush).toHaveBeenCalledTimes(1);
    expect(workspace!).toMatchObject({
      entity: Workspace,
      name: 'Acme',
    });
  });

  it('flushes a soft delete with RLS disabled only in a child context', async () => {
    const workspace = Object.assign(new Workspace(), { id: 'workspace_1' });
    const em = {
      getUnitOfWork: jest.fn(() => ({
        getById: jest.fn(() => workspace),
      })),
      assign: jest.fn((entity, data) => {
        expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.DISABLED);
        Object.assign(entity as object, data);
      }),
      flush: jest.fn(async () => {
        expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.DISABLED);
      }),
    } as unknown as EntityManager;
    const service = new WorkspaceService(em);

    await RequestContext.run(new RequestContext({ type: 'test' }), async () => {
      RowLevelSecurity.setMode(RowLevelSecurityMode.ENABLED);

      await expect(service.softDelete(workspace)).resolves.toBe(workspace);

      expect(RowLevelSecurity.getMode()).toBe(RowLevelSecurityMode.ENABLED);
    });

    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(em.assign).toHaveBeenCalledWith(
      workspace,
      expect.objectContaining({
        deletedAt: workspace.deletedAt,
      }),
      undefined,
    );
    expect(em.flush).toHaveBeenCalledTimes(1);
  });
});
