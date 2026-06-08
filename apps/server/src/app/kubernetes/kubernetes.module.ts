import {
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
} from '@kubernetes/client-node';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: KubeConfig,
      useFactory: () => {
        const kubeConfig = new KubeConfig();

        kubeConfig.loadFromDefault();

        if (!kubeConfig.getCurrentCluster()) {
          kubeConfig.loadFromCluster();
        }

        return kubeConfig;
      },
    },
    {
      provide: CustomObjectsApi,
      inject: [KubeConfig],
      useFactory: (kubeConfig: KubeConfig) =>
        kubeConfig.makeApiClient(CustomObjectsApi),
    },
    {
      provide: CoreV1Api,
      inject: [KubeConfig],
      useFactory: (kubeConfig: KubeConfig) =>
        kubeConfig.makeApiClient(CoreV1Api),
    },
  ],
  exports: [KubeConfig, CustomObjectsApi, CoreV1Api],
})
export class KubernetesModule {}
