import { Module } from '@nestjs/common';

import { AuthModule } from '@/app/auth/auth.module';
import { KubernetesModule } from '@/app/kubernetes';
import { ServiceModule } from '@/app/service/service.module';
import { UserModule } from '@/app/user/user.module';
import { WorkspaceModule } from '@/app/workspace/workspace.module';
import { WorkspaceMemberModule } from '@/app/workspace-member/workspace-member.module';

import { ServiceTerminalGateway } from './service-terminal.gateway';
import { ServiceTerminalGuard } from './service-terminal.guard';

@Module({
  imports: [
    AuthModule,
    KubernetesModule,
    ServiceModule,
    UserModule,
    WorkspaceModule,
    WorkspaceMemberModule,
  ],
  providers: [ServiceTerminalGateway, ServiceTerminalGuard],
})
export class ServiceTerminalModule {}
