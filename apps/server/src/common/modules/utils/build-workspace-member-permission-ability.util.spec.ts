jest.mock('@nest-boot/auth', () => ({
  BaseUser: class BaseUser {},
}));

import { PermissionAction } from '@nest-boot/permission';
import { RequestContext } from '@nest-boot/request-context';
import { subject } from '@casl/ability';

import { ApiKey } from '@/app/api-key/api-key.entity';
import { Domain } from '@/app/domain/domain.entity';
import { User } from '@/app/user/user.entity';
import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceMemberRole } from '@/app/workspace-member/enums/workspace-member-role.enum';
import { WorkspaceMemberStatus } from '@/app/workspace-member/enums/workspace-member-status.enum';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberPermission } from '@/app/workspace-member/workspace-member-permission.enum';
import { WorkspaceMemberGroup } from '@/app/workspace-member-group/workspace-member-group.entity';
import { WorkspaceMemberGroupMember } from '@/app/workspace-member-group-member/workspace-member-group-member.entity';

import { buildWorkspaceMemberPermissionAbility } from './build-workspace-member-permission-ability.util';

jest.mock('@nest-boot/request-context', () => ({
  RequestContext: {
    get: jest.fn(),
  },
}));

describe('buildWorkspaceMemberPermissionAbility', () => {
  beforeEach(() => {
    jest.mocked(RequestContext.get).mockReset();
  });

  it('grants base permissions when there is no active workspace member', () => {
    jest.mocked(RequestContext.get).mockReturnValue(undefined);

    const ability = buildWorkspaceMemberPermissionAbility([]);

    expect(ability.can(PermissionAction.READ, User)).toBe(true);
    expect(ability.can(PermissionAction.CREATE, Workspace)).toBe(true);
    expect(ability.can(PermissionAction.READ, Workspace)).toBe(true);
    expect(ability.can(PermissionAction.UPDATE, Workspace)).toBe(false);
  });

  it('only grants base permissions for disabled workspace members', () => {
    jest.mocked(RequestContext.get).mockReturnValue({
      status: WorkspaceMemberStatus.DISABLED,
    });

    const ability = buildWorkspaceMemberPermissionAbility([]);

    expect(ability.can(PermissionAction.CREATE, Workspace)).toBe(true);
    expect(ability.can(PermissionAction.MANAGE, ApiKey)).toBe(false);
  });

  it('grants owners full management permissions', () => {
    const ability = buildAbility({
      role: WorkspaceMemberRole.OWNER,
      permissions: [],
      workspace: {
        id: 'workspace_1',
      } as WorkspaceMember['workspace'],
    });

    expect(ability.can(PermissionAction.MANAGE, Workspace)).toBe(true);
    expect(ability.can(PermissionAction.DELETE, Workspace)).toBe(true);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_1' }),
      ),
    ).toBe(true);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_2' }),
      ),
    ).toBe(false);
  });

  it('allows admins to manage everything except workspace deletion', () => {
    const ability = buildAbility({
      role: WorkspaceMemberRole.ADMIN,
      permissions: [],
      workspace: {
        id: 'workspace_1',
      } as WorkspaceMember['workspace'],
    });

    expect(ability.can(PermissionAction.MANAGE, ApiKey)).toBe(true);
    expect(ability.can(PermissionAction.DELETE, Workspace)).toBe(false);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_1' }),
      ),
    ).toBe(true);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_2' }),
      ),
    ).toBe(false);
  });

  it('combines direct and group permissions for regular members', () => {
    const ability = buildAbility(
      {
        role: WorkspaceMemberRole.MEMBER,
        permissions: [WorkspaceMemberPermission.MANAGE_WORKSPACE],
        workspace: {
          id: 'workspace_1',
        } as WorkspaceMember['workspace'],
      },
      [
        WorkspaceMemberPermission.MANAGE_WORKSPACE,
        WorkspaceMemberPermission.MANAGE_MEMBERS,
      ],
    );

    expect(ability.can(PermissionAction.READ, Workspace)).toBe(true);
    expect(ability.can(PermissionAction.MANAGE, Domain)).toBe(false);
    expect(ability.can(PermissionAction.MANAGE, Workspace)).toBe(true);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_1' }),
      ),
    ).toBe(true);
    expect(
      ability.can(
        PermissionAction.UPDATE,
        subject('Workspace', { id: 'workspace_2' }),
      ),
    ).toBe(false);
    expect(ability.can(PermissionAction.MANAGE, WorkspaceMember)).toBe(true);
    expect(ability.can(PermissionAction.MANAGE, WorkspaceMemberGroup)).toBe(
      true,
    );
    expect(
      ability.can(PermissionAction.MANAGE, WorkspaceMemberGroupMember),
    ).toBe(true);
    expect(ability.can(PermissionAction.CREATE, ApiKey)).toBe(true);
  });

  it('grants domain management with the dedicated permission', () => {
    const ability = buildAbility({
      role: WorkspaceMemberRole.MEMBER,
      permissions: [WorkspaceMemberPermission.MANAGE_DOMAINS],
      workspace: {
        id: 'workspace_1',
      } as WorkspaceMember['workspace'],
    });

    expect(ability.can(PermissionAction.MANAGE, Domain)).toBe(true);
    expect(ability.can(PermissionAction.MANAGE, Workspace)).toBe(false);
    expect(ability.can(PermissionAction.MANAGE, WorkspaceMember)).toBe(false);
  });

  it('uses provided effective permissions', () => {
    jest.mocked(RequestContext.get).mockReturnValue({
      status: WorkspaceMemberStatus.ACTIVE,
      role: WorkspaceMemberRole.MEMBER,
    });

    const ability = buildWorkspaceMemberPermissionAbility([
      WorkspaceMemberPermission.MANAGE_MEMBERS,
    ]);

    expect(ability.can(PermissionAction.MANAGE, WorkspaceMember)).toBe(true);
  });
});

function buildAbility(
  member: Partial<WorkspaceMember>,
  permissions: WorkspaceMemberPermission[] = member.permissions ?? [],
) {
  jest.mocked(RequestContext.get).mockReturnValue({
    status: WorkspaceMemberStatus.ACTIVE,
    ...member,
  });

  return buildWorkspaceMemberPermissionAbility(permissions);
}
