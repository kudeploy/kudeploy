import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';

@Module({
  imports: [KubernetesModule, KubernetesGraphqlConnectionModule],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
