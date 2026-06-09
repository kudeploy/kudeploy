import { Module } from '@nestjs/common';
import { resolveTxt } from 'dns/promises';

import { DomainResolver } from './domain.resolver';
import {
  DOMAIN_NOW,
  DOMAIN_TXT_RESOLVER,
  DomainService,
} from './domain.service';

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
