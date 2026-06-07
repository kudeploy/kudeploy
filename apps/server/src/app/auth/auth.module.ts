import { AuthModule as BaseAuthModule } from '@nest-boot/auth';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { genericOAuth } from 'better-auth/plugins';

import { User } from '@/app/user/user.entity';

import { AuthGuard } from './auth.guard';
import { Account } from './entities/account.entity';
import { Session } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { RowLevelSecurityInterceptor } from './row-level-security.interceptor';

export function buildAuthPlugins(configService: ConfigService) {
  if (configService.get('AUTH_OIDC_ENABLED') !== 'true') {
    return [];
  }

  return [
    genericOAuth({
      config: [
        {
          providerId: 'oidc',
          clientId: configService.getOrThrow('AUTH_OIDC_ID'),
          clientSecret: configService.getOrThrow('AUTH_OIDC_SECRET'),
          discoveryUrl: configService.getOrThrow('AUTH_OIDC_DISCOVERY_URL'),
          prompt: 'login',
          scopes: ['openid', 'profile', 'email'],
        },
      ],
    }),
  ];
}

export function buildEmailAndPasswordOptions(configService: ConfigService) {
  return {
    enabled: configService.get('AUTH_EMAIL_ENABLED') !== 'false',
  };
}

/**
 * 应用认证模块。
 */
@Module({
  imports: [
    BaseAuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        trustedOrigins: ['*'],
        entities: {
          user: User,
          account: Account,
          session: Session,
          verification: Verification,
        },
        emailAndPassword: buildEmailAndPasswordOptions(configService),
        plugins: buildAuthPlugins(configService),
      }),
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
