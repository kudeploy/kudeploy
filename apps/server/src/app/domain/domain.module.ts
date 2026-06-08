import { Module } from '@nestjs/common';
import { resolveTxt } from 'dns/promises';

import {
  DOMAIN_NOW,
  DOMAIN_TXT_RESOLVER,
  DomainService,
} from './domain.service';
import { DomainResolver } from './domain.resolver';

/** 自定义域名功能模块。 */
@Module({
  providers: [
    DomainService,
    DomainResolver,
    {
      provide: DOMAIN_TXT_RESOLVER,
      useValue: resolveTxt,
    },
    {
      provide: DOMAIN_NOW,
      useValue: () => new Date(),
    },
  ],
  exports: [DomainService],
})
export class DomainModule {}
