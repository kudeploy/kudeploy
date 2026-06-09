import { registerEnumType } from '@nest-boot/graphql';

export enum DeploymentStatus {
  PENDING = 'PENDING',
  PROGRESSING = 'PROGRESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(DeploymentStatus, {
  name: 'DeploymentStatus',
});
