import { registerEnumType } from '@nest-boot/graphql';

export enum ServiceStatus {
  PENDING = 'PENDING',
  PROGRESSING = 'PROGRESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(ServiceStatus, {
  name: 'ServiceStatus',
});
