import { CryptModule } from '@nest-boot/crypt';
import { GraphQLModule } from '@nest-boot/graphql';
import { GraphQLConnectionModule } from '@nest-boot/graphql-connection';
import { LoggerModule } from '@nest-boot/logger';
import { MikroOrmModule } from '@nest-boot/mikro-orm';
import { RequestContextModule } from '@nest-boot/request-context';
import { RowLevelSecurityDriver } from '@nest-boot/row-level-security';
import { Global, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Request, Response } from 'express';
import { createRequire } from 'module';
import { dirname, join } from 'path';

import { ConfigModule } from '@/common/modules/config.module';
import { PermissionModule } from '@/common/modules/permission.module';

const nodeRequire = createRequire(__filename);
const clientAssetsRoot = join(
  dirname(nodeRequire.resolve('@kudeploy/client-assets/package.json')),
  'dist/client',
);

const ServeStaticDynamicModule = ServeStaticModule.forRoot({
  rootPath: clientAssetsRoot,
});

const GraphQLDynamicModule = GraphQLModule.forRoot({
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
});

const MikroORMDynamicModule = MikroOrmModule.forRoot({
  driver: RowLevelSecurityDriver,
});

/** 服务端公共基础设施模块。 */
@Global()
@Module({
  imports: [
    RequestContextModule,
    ConfigModule,
    MikroORMDynamicModule,
    GraphQLDynamicModule,
    GraphQLConnectionModule,
    LoggerModule,
    PermissionModule,
    CryptModule,
    ServeStaticDynamicModule,
  ],
  exports: [PermissionModule],
})
export class CommonModule {}
