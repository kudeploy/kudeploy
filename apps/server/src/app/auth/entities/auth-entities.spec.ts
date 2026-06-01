jest.mock('@nest-boot/auth', () => ({
  BaseAccount: class BaseAccount {},
  BaseSession: class BaseSession {},
  BaseVerification: class BaseVerification {},
}));

import { Account } from './account.entity';
import { Session } from './session.entity';
import { Verification } from './verification.entity';

describe('Auth entities', () => {
  it('constructs Better Auth entity extensions', () => {
    expect(new Account()).toBeInstanceOf(Account);
    expect(new Session()).toBeInstanceOf(Session);
    expect(new Verification()).toBeInstanceOf(Verification);
  });
});
