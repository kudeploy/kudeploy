import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { KubernetesLogsModule } from '@/app/kubernetes-logs';
import { KubernetesMetricsModule } from '@/app/kubernetes-metrics';
import { ProjectModule } from '@/app/project/project.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';

@Module({
  imports: [
    KubernetesModule,
    KubernetesGraphqlConnectionModule,
    KubernetesLogsModule,
    KubernetesMetricsModule,
    ProjectModule,
  ],
  providers: [ServiceResolver, ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
