import { PermissionGuard } from '@nest-boot/permission';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ApiKeyModule } from '@/app/api-key/api-key.module';
import { AuthGuard } from '@/app/auth/auth.guard';
import { AuthModule } from '@/app/auth/auth.module';
import { DeploymentModule } from '@/app/deployment';
import { DomainModule } from '@/app/domain/domain.module';
import { ProjectModule } from '@/app/project/project.module';
import { RegistryCredentialModule } from '@/app/registry-credential';
import { ServiceModule } from '@/app/service/service.module';
import { ServiceTerminalModule } from '@/app/service-terminal/service-terminal.module';
import { UserModule } from '@/app/user/user.module';
import { VolumeModule } from '@/app/volume';
import { WorkspaceModule } from '@/app/workspace/workspace.module';
import { WorkspaceMemberModule } from '@/app/workspace-member/workspace-member.module';
import { WorkspaceMemberGroupModule } from '@/app/workspace-member-group/workspace-member-group.module';
import { WorkspaceMemberGroupMemberModule } from '@/app/workspace-member-group-member/workspace-member-group-member.module';
import { CommonModule } from '@/common/common.module';

/** 服务端根模块。 */
@Module({
  imports: [
    CommonModule,
    AuthModule,
    ApiKeyModule,
    UserModule,
    WorkspaceModule,
    WorkspaceMemberModule,
    WorkspaceMemberGroupModule,
    WorkspaceMemberGroupMemberModule,
    DomainModule,
    ProjectModule,
    RegistryCredentialModule,
    ServiceModule,
    DeploymentModule,
    VolumeModule,
    ServiceTerminalModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: PermissionGuard,
    },
  ],
})
export class AppModule {}
