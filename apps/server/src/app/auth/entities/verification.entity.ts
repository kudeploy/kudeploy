import { Entity } from '@mikro-orm/core';
import { BaseVerification } from '@nest-boot/auth';

/**
 * better-auth 验证令牌实体。
 */
@Entity()
export class Verification extends BaseVerification {}
