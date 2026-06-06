import { Global, Module } from '@nestjs/common';

import { KubernetesConnectionManager } from './kubernetes-connection.manager';

@Global()
@Module({
  providers: [KubernetesConnectionManager],
  exports: [KubernetesConnectionManager],
})
export class KubernetesGraphqlConnectionModule {}
