jest.mock('@nest-boot/graphql-connection', () => ({
  ConnectionBuilder: class ConnectionBuilder {
    addField() {
      return this;
    }

    build() {
      return {
        Connection: class Connection {},
        ConnectionArgs: class ConnectionArgs {},
      };
    }
  },
  ConnectionManager: class ConnectionManager {},
}));

import { Workspace } from '@/app/workspace/workspace.entity';

import { Domain } from './domain.entity';
import { DomainResolver } from './domain.resolver';
import { DomainService } from './domain.service';

describe('DomainResolver', () => {
  it('lists domains for the current workspace', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const args = { first: 10 } as never;
    const { resolver, cm } = createResolver();

    await resolver.domains(args, workspace);

    expect(cm.find).toHaveBeenCalledWith(expect.any(Function), args, {
      where: { workspace },
    });
  });

  it('creates domains for the current workspace', async () => {
    const workspace = { id: 'workspace_1' } as Workspace;
    const domain = { id: 'domain_1' } as Domain;
    const { resolver, domainService } = createResolver({
      domainService: {
        createDomain: jest.fn(async () => domain),
      },
    });

    await expect(
      resolver.createDomain({ name: 'example.com' }, workspace),
    ).resolves.toBe(domain);

    expect(domainService.createDomain).toHaveBeenCalledWith(workspace, {
      name: 'example.com',
    });
  });

  it('verifies workspace-owned domains', async () => {
    const domain = { id: 'domain_1' } as Domain;
    const { resolver, domainService } = createResolver({
      domainService: {
        findOneOrFail: jest.fn(async () => domain),
        verifyDomain: jest.fn(async () => domain),
      },
    });

    await expect(
      resolver.verifyDomain('domain_1', { id: 'workspace_1' } as Workspace),
    ).resolves.toBe(domain);

    expect(domainService.findOneOrFail).toHaveBeenCalledWith({
      id: 'domain_1',
      workspace: { id: 'workspace_1' },
    });
    expect(domainService.verifyDomain).toHaveBeenCalledWith(domain);
  });

  it('deletes workspace-owned domains', async () => {
    const domain = { id: 'domain_1' } as Domain;
    const { resolver, domainService } = createResolver({
      domainService: {
        findOneOrFail: jest.fn(async () => domain),
        remove: jest.fn(async () => domain),
      },
    });

    await expect(
      resolver.deleteDomain('domain_1', { id: 'workspace_1' } as Workspace),
    ).resolves.toBe(domain);

    expect(domainService.findOneOrFail).toHaveBeenCalledWith({
      id: 'domain_1',
      workspace: { id: 'workspace_1' },
    });
    expect(domainService.remove).toHaveBeenCalledWith(domain);
  });
});

function createResolver(overrides?: {
  domainService?: Partial<DomainService>;
  cm?: { find: jest.Mock };
}) {
  const domainService = {
    createDomain: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    remove: jest.fn(),
    verifyDomain: jest.fn(),
    ...overrides?.domainService,
  } as unknown as jest.Mocked<DomainService>;
  const cm = overrides?.cm ?? { find: jest.fn() };
  const resolver = new DomainResolver(domainService, cm as never);

  return {
    cm,
    domainService,
    resolver,
  };
}
