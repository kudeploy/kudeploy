import { Module } from '@nestjs/common';

import { WorkspaceMemberModule } from '@/app/workspace-member/workspace-member.module';

import { WorkspaceMemberGroupResolver } from './workspace-member-group.resolver';
import { WorkspaceMemberGroupService } from './workspace-member-group.service';

/** 工作区成员组模块。 */
@Module({
  imports: [WorkspaceMemberModule],
  providers: [WorkspaceMemberGroupResolver, WorkspaceMemberGroupService],
  exports: [WorkspaceMemberGroupService],
})
export class WorkspaceMemberGroupModule {}
