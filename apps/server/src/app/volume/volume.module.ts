import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { ProjectModule } from '@/app/project/project.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import { ProjectVolumeResolver, VolumeResolver } from './volume.resolver';
import { VolumeService } from './volume.service';

@Module({
  imports: [KubernetesModule, KubernetesGraphqlConnectionModule, ProjectModule],
  providers: [ProjectVolumeResolver, VolumeResolver, VolumeService],
  exports: [VolumeService],
})
export class VolumeModule {}
