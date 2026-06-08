import { Field, Float, Int, ObjectType } from '@nest-boot/graphql';

@ObjectType()
export class KubernetesMetricPoint {
  @Field(() => Date)
  timestamp!: Date;

  @Field(() => Float)
  value!: number;
}

@ObjectType()
export class ServiceMetrics {
  @Field(() => Boolean)
  available!: boolean;

  @Field(() => Int)
  rangeSeconds!: number;

  @Field(() => Int)
  stepSeconds!: number;

  @Field(() => Float, { nullable: true })
  cpuLimitMillicores!: number | null;

  @Field(() => Float, { nullable: true })
  memoryLimitBytes!: number | null;

  @Field(() => [KubernetesMetricPoint])
  cpuUsageMillicores!: KubernetesMetricPoint[];

  @Field(() => [KubernetesMetricPoint])
  memoryUsageBytes!: KubernetesMetricPoint[];

  @Field(() => [KubernetesMetricPoint])
  networkReceiveBytesPerSecond!: KubernetesMetricPoint[];

  @Field(() => [KubernetesMetricPoint])
  networkTransmitBytesPerSecond!: KubernetesMetricPoint[];
}
