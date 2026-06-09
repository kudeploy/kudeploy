import { AuthService } from '@nest-boot/auth';
import { PermissionAction } from '@nest-boot/permission';
import { RequestContext } from '@nest-boot/request-context';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import type { Socket } from 'socket.io';

import { Service } from '@/app/service/service.object';
import { User } from '@/app/user/user.entity';
import { UserService } from '@/app/user/user.service';
import { Workspace } from '@/app/workspace/workspace.entity';
import { WorkspaceService } from '@/app/workspace/workspace.service';
import { WorkspaceMember } from '@/app/workspace-member/workspace-member.entity';
import { WorkspaceMemberService } from '@/app/workspace-member/workspace-member.service';
import { buildWorkspaceMemberPermissionAbility } from '@/common/modules/utils/build-workspace-member-permission-ability.util';

@Injectable()
export class ServiceTerminalGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient<Socket>();
    const ctx = new RequestContext({ type: 'ws' });

    return await RequestContext.run(ctx, async () => {
      try {
        const session = await this.getSession(socket.handshake.headers);
        const userId = session?.user?.id;
        const workspaceId = this.getWorkspaceId(socket);

        if (!userId || !workspaceId) {
          return false;
        }

        const user = await this.userService.findOneOrFail({ id: userId });
        const workspace = await this.workspaceService.findOne({
          id: workspaceId,
          deletedAt: null,
        });

        if (!workspace) {
          return false;
        }

        const workspaceMember = await this.workspaceMemberService.findOne({
          user,
          workspace,
        });

        if (!workspaceMember) {
          return false;
        }

        RequestContext.set(User, user);
        RequestContext.set(Workspace, workspace);
        RequestContext.set(WorkspaceMember, workspaceMember);

        const permissions =
          await this.workspaceMemberService.getPermissions(workspaceMember);
        const ability = buildWorkspaceMemberPermissionAbility(permissions);

        if (!ability.can(PermissionAction.UPDATE, Service)) {
          return false;
        }

        socket.data.ctx = ctx;

        return true;
      } catch {
        return false;
      }
    });
  }

  private async getSession(headers: IncomingHttpHeaders): Promise<{
    user?: { id?: string };
  } | null> {
    return await this.authService.api.getSession({
      headers: Object.entries(headers).reduce(
        (requestHeaders, [key, value]) => {
          if (!value) {
            return requestHeaders;
          }

          if (Array.isArray(value)) {
            for (const item of value) {
              requestHeaders.append(key, item);
            }
          } else {
            requestHeaders.append(key, value);
          }

          return requestHeaders;
        },
        new Headers(),
      ),
    });
  }

  private getWorkspaceId(socket: Socket): string | null {
    const authWorkspaceId = socket.handshake.auth?.workspaceId;
    if (typeof authWorkspaceId === 'string' && authWorkspaceId.trim()) {
      return authWorkspaceId.trim();
    }

    const headerWorkspaceId = socket.handshake.headers['x-workspace-id'];
    if (typeof headerWorkspaceId === 'string' && headerWorkspaceId.trim()) {
      return headerWorkspaceId.trim();
    }

    if (Array.isArray(headerWorkspaceId)) {
      const workspaceId = headerWorkspaceId.find((item) => item.trim());
      if (workspaceId) {
        return workspaceId.trim();
      }
    }

    return this.getCookieValue(socket.handshake.headers.cookie, 'workspace_id');
  }

  private getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return null;
    }

    for (const cookie of cookieHeader.split(';')) {
      const [key, ...valueParts] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(valueParts.join('=')).trim() || null;
      }
    }

    return null;
  }
}
