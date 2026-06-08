import { registerEnumType } from '@nest-boot/graphql';

export enum ServiceHealthCheckType {
  HTTP = 'HTTP',
  TCP = 'TCP',
}

registerEnumType(ServiceHealthCheckType, {
  name: 'ServiceHealthCheckType',
});
