import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { KubernetesLogsModule } from '@/app/kubernetes-logs';
import { KubernetesMetricsModule } from '@/app/kubernetes-metrics';
import { ProjectModule } from '@/app/project/project.module';
import { RegistryCredentialModule } from '@/app/registry-credential';
import { VolumeModule } from '@/app/volume';
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
    RegistryCredentialModule,
    VolumeModule,
  ],
  providers: [ServiceResolver, ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
