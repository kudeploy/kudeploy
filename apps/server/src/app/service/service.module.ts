import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { ProjectModule } from '@/app/project/project.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';

@Module({
  imports: [KubernetesModule, KubernetesGraphqlConnectionModule, ProjectModule],
  providers: [ServiceResolver, ServiceService],
})
export class ServiceModule {}
