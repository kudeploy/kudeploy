import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('can be imported with real ESM auth dependencies', () => {
    expect(AuthModule).toBeDefined();
  });
});
