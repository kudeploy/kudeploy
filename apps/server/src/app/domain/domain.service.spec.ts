import { BadRequestException } from '@nestjs/common';

import { Workspace } from '@/app/workspace/workspace.entity';

import { Domain } from './domain.entity';
import { DomainStatus } from './domain-status.enum';
import { DomainService } from './domain.service';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() =>
    Buffer.from('0123456789abcdef0123456789abcdef', 'hex'),
  ),
}));

describe('DomainService', () => {
  it('creates pending workspace domains with a verification token', async () => {
    const { service, em } = createService();
    const workspace = { id: 'workspace_1' } as Workspace;

    const domain = await service.createDomain(workspace, {
      name: 'Example.COM',
    });

    expect(em.findOne).toHaveBeenCalledWith(Domain, {
      workspace,
      name: 'example.com',
    });
    expect(em.create).toHaveBeenCalledWith(
      Domain,
      expect.objectContaining({
        workspace,
        name: 'example.com',
        status: DomainStatus.PENDING,
        verificationToken: '0123456789abcdef0123456789abcdef',
        verifiedAt: null,
      }),
    );
    expect(em.persist).toHaveBeenCalledWith(domain);
    expect(em.flush).toHaveBeenCalled();
  });

  it('allows the same domain name to be created in different workspaces', async () => {
    const { service, em } = createService({
      existingDomains: [null, null],
    });

    await expect(
      service.createDomain({ id: 'workspace_1' } as Workspace, {
        name: 'example.com',
      }),
    ).resolves.toEqual(expect.objectContaining({ name: 'example.com' }));

    await expect(
      service.createDomain({ id: 'workspace_2' } as Workspace, {
        name: 'example.com',
      }),
    ).resolves.toEqual(expect.objectContaining({ name: 'example.com' }));

    expect(em.findOne).toHaveBeenNthCalledWith(1, Domain, {
      workspace: { id: 'workspace_1' },
      name: 'example.com',
    });
    expect(em.findOne).toHaveBeenNthCalledWith(2, Domain, {
      workspace: { id: 'workspace_2' },
      name: 'example.com',
    });
  });

  it('rejects duplicate domain names in the same workspace', async () => {
    const existing = { id: 'domain_1' } as Domain;
    const { service, em } = createService({
      existingDomains: [existing],
    });
    const workspace = { id: 'workspace_1' } as Workspace;

    await expect(
      service.createDomain(workspace, {
        name: 'example.com',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(em.findOne).toHaveBeenCalledWith(Domain, {
      workspace,
      name: 'example.com',
    });
    expect(em.create).not.toHaveBeenCalled();
    expect(em.flush).not.toHaveBeenCalled();
  });

  it('marks a domain as verified when the prefixed TXT record matches exactly', async () => {
    const verifiedAt = new Date('2026-06-08T00:00:00.000Z');
    const domain = {
      name: 'example.com',
      status: DomainStatus.PENDING,
      verificationToken: 'domain-token',
      verifiedAt: null,
    } as Domain;
    const { service, em, resolveTxt } = createService({
      now: verifiedAt,
      txtRecords: [['domain-verify=domain-token']],
    });

    await expect(service.verifyDomain(domain)).resolves.toBe(domain);

    expect(resolveTxt).toHaveBeenCalledWith('_kudeploy.example.com');
    expect(domain.status).toBe(DomainStatus.VERIFIED);
    expect(domain.verifiedAt).toBe(verifiedAt);
    expect(em.flush).toHaveBeenCalled();
  });

  it('rejects verification when TXT records do not exactly match the verification value', async () => {
    const domain = {
      name: 'example.com',
      status: DomainStatus.PENDING,
      verificationToken: 'domain-token',
      verifiedAt: null,
    } as Domain;
    const { service, em } = createService({
      txtRecords: [
        ['domain-token'],
        ['kudeploy-domain-verification=domain-token'],
      ],
    });

    await expect(service.verifyDomain(domain)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(domain.status).toBe(DomainStatus.PENDING);
    expect(domain.verifiedAt).toBeNull();
    expect(em.flush).not.toHaveBeenCalled();
  });

  it('rejects verification when TXT lookup fails', async () => {
    const domain = {
      name: 'example.com',
      status: DomainStatus.PENDING,
      verificationToken: 'domain-token',
      verifiedAt: null,
    } as Domain;
    const { service, em } = createService({
      txtError: new Error('queryTxt ENODATA example.com'),
    });

    await expect(service.verifyDomain(domain)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(domain.status).toBe(DomainStatus.PENDING);
    expect(domain.verifiedAt).toBeNull();
    expect(em.flush).not.toHaveBeenCalled();
  });
});

function createService(options?: {
  existingDomains?: Array<Domain | null>;
  now?: Date;
  txtError?: Error;
  txtRecords?: string[][];
}) {
  const createdEntities: Domain[] = [];
  const em = {
    create: jest.fn((_entity, data) => {
      const domain = data as Domain;
      createdEntities.push(domain);

      return domain;
    }),
    findOne: jest.fn(async () => options?.existingDomains?.shift() ?? null),
    flush: jest.fn(async () => undefined),
    persist: jest.fn(() => em),
  };
  const resolveTxt = jest.fn(async () => {
    if (options?.txtError) {
      throw options.txtError;
    }

    return options?.txtRecords ?? [];
  });
  const service = new DomainService(
    em as never,
    resolveTxt,
    () => options?.now ?? new Date('2026-06-08T00:00:00.000Z'),
  );

  return {
    createdEntities,
    em,
    resolveTxt,
    service,
  };
}
