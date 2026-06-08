import { EntityManager } from '@mikro-orm/postgresql';
import { EntityService } from '@nest-boot/mikro-orm';
import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { resolveTxt } from 'dns/promises';

import { Workspace } from '@/app/workspace/workspace.entity';

import { Domain } from './domain.entity';
import { DomainStatus } from './domain-status.enum';

export const DOMAIN_TXT_RESOLVER = Symbol('DOMAIN_TXT_RESOLVER');
export const DOMAIN_NOW = Symbol('DOMAIN_NOW');

type TxtResolver = (hostname: string) => Promise<string[][]>;
type Clock = () => Date;

/** 创建域名时可配置的业务参数。 */
export interface CreateDomainOptions {
  /** 域名，例如 example.com。 */
  name: string;
}

/** 管理工作区自定义域名创建和 TXT 验证。 */
@Injectable()
export class DomainService extends EntityService<Domain> {
  constructor(
    /** 当前请求使用的 MikroORM `EntityManager`。 */
    protected readonly em: EntityManager,
    @Optional()
    @Inject(DOMAIN_TXT_RESOLVER)
    private readonly txtResolver: TxtResolver = resolveTxt,
    @Optional()
    @Inject(DOMAIN_NOW)
    private readonly clock: Clock = () => new Date(),
  ) {
    super(Domain, em);
  }

  /** 为工作区创建等待验证的域名。 */
  async createDomain(
    workspace: Workspace,
    options: CreateDomainOptions,
  ): Promise<Domain> {
    const name = this.normalizeDomainName(options.name);
    const existing = await this.findOne({
      workspace,
      name,
    });

    if (existing) {
      throw new BadRequestException('Domain already exists in this workspace');
    }

    const domain = this.em.create(Domain, {
      workspace,
      name,
      status: DomainStatus.PENDING,
      verificationToken: this.generateVerificationToken(),
      verifiedAt: null,
    });

    await this.em.persist(domain).flush();

    return domain;
  }

  /** 通过 DNS TXT 记录验证域名。 */
  async verifyDomain(domain: Domain): Promise<Domain> {
    const records = await this.resolveDomainTxt(domain.name);
    const values = records.map((record) => record.join(''));

    if (!values.some((value) => value.includes(domain.verificationToken))) {
      throw new BadRequestException(
        'Domain TXT record does not contain the verification token',
      );
    }

    domain.status = DomainStatus.VERIFIED;
    domain.verifiedAt = this.clock();

    await this.em.flush();

    return domain;
  }

  private normalizeDomainName(name: string) {
    return name.trim().toLowerCase().replace(/\.$/, '');
  }

  private generateVerificationToken() {
    return randomBytes(16).toString('hex');
  }

  private async resolveDomainTxt(name: string) {
    try {
      return await this.txtResolver(name);
    } catch {
      throw new BadRequestException(
        'Domain TXT record does not contain the verification token',
      );
    }
  }
}
