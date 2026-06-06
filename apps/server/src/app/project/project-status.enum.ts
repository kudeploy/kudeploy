import { registerEnumType } from '@nest-boot/graphql';

export enum ProjectStatus {
  PENDING = 'PENDING',
  PROGRESSING = 'PROGRESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
});
