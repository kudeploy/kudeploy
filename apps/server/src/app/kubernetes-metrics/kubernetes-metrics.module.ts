import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';

import { KubernetesMetricsService } from './kubernetes-metrics.service';
import { PrometheusClient } from './prometheus.client';

@Module({
  imports: [KubernetesModule],
  providers: [KubernetesMetricsService, PrometheusClient],
  exports: [KubernetesMetricsService],
})
export class KubernetesMetricsModule {}
