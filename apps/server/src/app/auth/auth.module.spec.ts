import { ConfigService } from '@nestjs/config';

import { AuthModule, buildAuthPlugins } from './auth.module';

describe('AuthModule', () => {
  it('can be imported with real ESM auth dependencies', () => {
    expect(AuthModule).toBeDefined();
  });

  it('does not require OIDC configuration when OIDC is disabled', () => {
    const configService = {
      get: jest.fn(() => undefined),
      getOrThrow: jest.fn(),
    } as unknown as ConfigService;

    expect(buildAuthPlugins(configService)).toEqual([]);
    expect(configService.get).toHaveBeenCalledWith('AUTH_OIDC_ENABLED');
    expect(configService.getOrThrow).not.toHaveBeenCalled();
  });

  it('loads OIDC configuration when OIDC is enabled', () => {
    const values = new Map([
      ['AUTH_OIDC_ENABLED', 'true'],
      ['AUTH_OIDC_ID', 'server'],
      ['AUTH_OIDC_SECRET', 'server-secret'],
      ['AUTH_OIDC_DISCOVERY_URL', 'https://auth.example.test/.well-known/openid-configuration'],
    ]);
    const configService = {
      get: jest.fn((key: string) => values.get(key)),
      getOrThrow: jest.fn((key: string) => {
        const value = values.get(key);

        if (!value) {
          throw new Error(`Missing ${key}`);
        }

        return value;
      }),
    } as unknown as ConfigService;

    expect(buildAuthPlugins(configService)).toHaveLength(1);
    expect(configService.getOrThrow).toHaveBeenCalledWith('AUTH_OIDC_ID');
    expect(configService.getOrThrow).toHaveBeenCalledWith('AUTH_OIDC_SECRET');
    expect(configService.getOrThrow).toHaveBeenCalledWith(
      'AUTH_OIDC_DISCOVERY_URL',
    );
  });
});
