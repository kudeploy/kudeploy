import { registerEnumType } from '@nest-boot/graphql';

export enum VolumeStatus {
  PENDING = 'PENDING',
  BOUND = 'BOUND',
  LOST = 'LOST',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(VolumeStatus, {
  name: 'VolumeStatus',
});
