import { Module } from '@nestjs/common';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

/**
 * 用户功能模块。
 */
@Module({
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
