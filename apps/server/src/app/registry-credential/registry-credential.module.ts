import { Module } from '@nestjs/common';

import { KubernetesModule } from '@/app/kubernetes';
import { ProjectModule } from '@/app/project/project.module';
import { KubernetesGraphqlConnectionModule } from '@/lib/kubernetes-graphql-connection';

import {
  ProjectRegistryCredentialResolver,
  RegistryCredentialResolver,
} from './registry-credential.resolver';
import { RegistryCredentialService } from './registry-credential.service';

@Module({
  imports: [KubernetesModule, KubernetesGraphqlConnectionModule, ProjectModule],
  providers: [
    ProjectRegistryCredentialResolver,
    RegistryCredentialResolver,
    RegistryCredentialService,
  ],
  exports: [RegistryCredentialService],
})
export class RegistryCredentialModule {}
