import { registerEnumType } from '@nest-boot/graphql';

/** 域名验证状态。 */
export enum DomainStatus {
  /** 等待 TXT 验证。 */
  PENDING = 'PENDING',
  /** TXT 记录已验证。 */
  VERIFIED = 'VERIFIED',
}

registerEnumType(DomainStatus, {
  name: 'DomainStatus',
});
