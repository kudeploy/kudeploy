import { AuthModule as BaseAuthModule } from '@nest-boot/auth';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { User } from '@/app/user/user.entity';

import { AuthGuard } from './auth.guard';
import { Account } from './entities/account.entity';
import { Session } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { RowLevelSecurityInterceptor } from './row-level-security.interceptor';

/**
 * 应用认证模块。
 */
@Module({
  imports: [
    BaseAuthModule.forRoot({
      trustedOrigins: ['*'],
      entities: {
        user: User,
        account: Account,
        session: Session,
        verification: Verification,
      },
    }),
  ],
  providers: [
    AuthGuard,
    RowLevelSecurityInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: RowLevelSecurityInterceptor,
    },
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
