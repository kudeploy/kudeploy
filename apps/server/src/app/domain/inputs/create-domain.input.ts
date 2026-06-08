import { Field, InputType } from '@nest-boot/graphql';
import { IsFQDN, IsString, MaxLength } from 'class-validator';

/** 创建域名的输入参数。 */
@InputType()
export class CreateDomainInput {
  /** 域名，例如 example.com。 */
  @IsString()
  @IsFQDN({ require_tld: true, allow_trailing_dot: true })
  @MaxLength(255)
  @Field(() => String)
  name!: string;
}
