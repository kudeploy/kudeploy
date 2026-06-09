import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { ServiceModule } from '@/app/service/service.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { DeploymentResolver } from './deployment.resolver';
import { DeploymentService } from './deployment.service';

@Module({
  imports: [KubernetesModule, KubernetesGraphqlConnectionModule, ServiceModule],
  providers: [DeploymentResolver, DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule {}
