import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { KubernetesMetricsModule } from '@/app/kubernetes-metrics';
import { ProjectModule } from '@/app/project/project.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';

@Module({
  imports: [
    KubernetesModule,
    KubernetesGraphqlConnectionModule,
    KubernetesMetricsModule,
    ProjectModule,
  ],
  providers: [ServiceResolver, ServiceService],
})
export class ServiceModule {}
