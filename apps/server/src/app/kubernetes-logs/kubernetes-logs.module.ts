import { Module } from '@nestjs/common';

import { KubernetesLogsService } from './kubernetes-logs.service';
import { VictoriaLogsClient } from './victoria-logs.client';

@Module({
  providers: [KubernetesLogsService, VictoriaLogsClient],
  exports: [KubernetesLogsService],
})
export class KubernetesLogsModule {}
