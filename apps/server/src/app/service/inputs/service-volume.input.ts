import { Field, ID, InputType } from '@nest-boot/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class ServiceVolumeInput {
  @IsString()
  @Field(() => ID)
  volumeId!: string;

  @IsString()
  @Field(() => String)
  mountPath!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  subPath?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  readOnly?: boolean | null;
}
