import { RequestContext } from '@nest-boot/request-context';
import type { ExecutionContext } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { User } from '@/app/user/user.entity';
import { UserService } from '@/app/user/user.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceService } from '@/app/workspace/workspace.service';
import { WorkspaceMemberRole } from '@/app/workspace-member/enums/workspace-member-role.enum';
import { WorkspaceMemberStatus } from '@/app/workspace-member/enums/workspace-member-status.enum';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberService } from '@/app/workspace-member/workspace-member.service';

import { ServiceTerminalGuard } from './service-terminal.guard';

describe('ServiceTerminalGuard', () => {
  it('authenticates websocket sessions and stores workspace context', async () => {
    const user = { id: 'user_1' } as User;
    const workspace = { id: 'workspace_1' } as Workspace;
    const workspaceMember = {
      id: 'member_1',
      permissions: [],
      role: WorkspaceMemberRole.OWNER,
      status: WorkspaceMemberStatus.ACTIVE,
      workspace,
    } as WorkspaceMember;
    const socket = createSocket({
      auth: { workspaceId: 'workspace_1' },
      headers: { cookie: 'better-auth.session_token=token' },
    });
    const { authService, guard, userService, workspaceMemberService } =
      createGuard({
        session: { user: { id: user.id } },
        user,
        workspace,
        workspaceMember,
      });

    await expect(guard.canActivate(createWsContext(socket))).resolves.toBe(
      true,
    );

    expect(authService.api.getSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
    expect(userService.findOneOrFail).toHaveBeenCalledWith({ id: 'user_1' });
    expect(workspaceMemberService.findOne).toHaveBeenCalledWith({
      user,
      workspace,
    });
    expect(workspaceMemberService.getPermissions).toHaveBeenCalledWith(
      workspaceMember,
    );
    await RequestContext.run(socket.data.ctx, async () => {
      expect(RequestContext.get(User)).toBe(user);
      expect(RequestContext.get(Workspace)).toBe(workspace);
      expect(RequestContext.get(WorkspaceMember)).toBe(workspaceMember);
    });
  });

  it('falls back to the workspace_id cookie when auth payload is empty', async () => {
    const workspace = { id: 'workspace_cookie' } as Workspace;
    const socket = createSocket({
      headers: {
        cookie:
          'better-auth.session_token=token; workspace_id=workspace_cookie',
      },
    });
    const { guard, workspaceService } = createGuard({
      session: { user: { id: 'user_1' } },
      user: { id: 'user_1' } as User,
      workspace,
      workspaceMember: {
        id: 'member_1',
        permissions: [],
        role: WorkspaceMemberRole.OWNER,
        status: WorkspaceMemberStatus.ACTIVE,
        workspace,
      } as WorkspaceMember,
    });

    await expect(guard.canActivate(createWsContext(socket))).resolves.toBe(
      true,
    );

    expect(workspaceService.findOne).toHaveBeenCalledWith({
      id: 'workspace_cookie',
      deletedAt: null,
    });
  });

  it('rejects websocket sessions without a workspace member', async () => {
    const socket = createSocket({
      auth: { workspaceId: 'workspace_1' },
      headers: { cookie: 'better-auth.session_token=token' },
    });
    const { guard } = createGuard({
      session: { user: { id: 'user_1' } },
      user: { id: 'user_1' } as User,
      workspace: { id: 'workspace_1' } as Workspace,
      workspaceMember: null,
    });

    await expect(guard.canActivate(createWsContext(socket))).resolves.toBe(
      false,
    );
  });

  it('rejects regular members without service update permission', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const workspaceMember = {
      id: 'member_1',
      permissions: [],
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.ACTIVE,
      workspace,
    } as WorkspaceMember;
    const socket = createSocket({
      auth: { workspaceId: 'workspace_1' },
      headers: { cookie: 'better-auth.session_token=token' },
    });
    const { guard, workspaceMemberService } = createGuard({
      session: { user: { id: 'user_1' } },
      user: { id: 'user_1' } as User,
      workspace,
      workspaceMember,
    });

    await expect(guard.canActivate(createWsContext(socket))).resolves.toBe(
      false,
    );
    expect(workspaceMemberService.getPermissions).toHaveBeenCalledWith(
      workspaceMember,
    );
    expect(socket.data.ctx).toBeUndefined();
  });
});

function createGuard({
  session,
  user,
  workspace,
  workspaceMember,
}: {
  session: unknown;
  user: User;
  workspace: Workspace;
  workspaceMember: WorkspaceMember | null;
}) {
  const authService = {
    api: {
      getSession: jest.fn(async () => session),
    },
  };
  const userService = {
    findOneOrFail: jest.fn(async () => user),
  };
  const workspaceService = {
    findOne: jest.fn(async () => workspace),
  };
  const workspaceMemberService = {
    findOne: jest.fn(async () => workspaceMember),
    getPermissions: jest.fn(async () => workspaceMember?.permissions ?? []),
  };

  return {
    authService,
    guard: new ServiceTerminalGuard(
      authService as never,
      userService as unknown as UserService,
      workspaceService as unknown as WorkspaceService,
      workspaceMemberService as unknown as WorkspaceMemberService,
    ),
    userService,
    workspaceMemberService,
    workspaceService,
  };
}

function createSocket({
  auth = {},
  headers = {},
}: {
  auth?: Record<string, unknown>;
  headers?: Record<string, string>;
}): Socket {
  return {
    data: {},
    handshake: {
      auth,
      headers,
    },
  } as unknown as Socket;
}

function createWsContext(socket: Socket): ExecutionContext {
  return {
    switchToWs: () => ({
      getClient: () => socket,
    }),
  } as ExecutionContext;
}
