jest.mock('@kubernetes/client-node', () => {
  class KubeConfig {
    private currentCluster: { server: string } | null = null;

    loadFromDefault() {
      mockLoadFromDefault.call(this);
    }

    loadFromCluster() {
      mockLoadFromCluster.call(this);
    }

    getCurrentCluster() {
      return this.currentCluster;
    }

    makeApiClient(ApiClient: new () => unknown) {
      return new ApiClient();
    }
  }

  return {
    CoreV1Api: class CoreV1Api {},
    CustomObjectsApi: class CustomObjectsApi {},
    Exec: class Exec {
      constructor(readonly kubeConfig: KubeConfig) {}
    },
    KubeConfig,
  };
});

import { Exec, KubeConfig } from '@kubernetes/client-node';
import { MODULE_METADATA } from '@nestjs/common/constants';

import { KubernetesModule } from './kubernetes.module';

const mockLoadFromDefault = jest.fn(function (this: {
  currentCluster: { server: string } | null;
}) {
  this.currentCluster = { server: 'https://example.test:6443' };
});

const mockLoadFromCluster = jest.fn(function (this: {
  currentCluster: { server: string } | null;
}) {
  this.currentCluster = {
    server: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT}`,
  };
});

describe('KubernetesModule', () => {
  const originalEnv = {
    KUBECONFIG: process.env.KUBECONFIG,
    KUBERNETES_SERVICE_HOST: process.env.KUBERNETES_SERVICE_HOST,
    KUBERNETES_SERVICE_PORT: process.env.KUBERNETES_SERVICE_PORT,
  };

  afterEach(() => {
    jest.clearAllMocks();
    restoreEnv('KUBECONFIG', originalEnv.KUBECONFIG);
    restoreEnv('KUBERNETES_SERVICE_HOST', originalEnv.KUBERNETES_SERVICE_HOST);
    restoreEnv('KUBERNETES_SERVICE_PORT', originalEnv.KUBERNETES_SERVICE_PORT);
  });

  it('loads the default kubeconfig before falling back to in-cluster config', () => {
    delete process.env.KUBERNETES_SERVICE_HOST;
    delete process.env.KUBERNETES_SERVICE_PORT;

    const kubeConfig = getKubeConfigProvider().useFactory();

    expect(mockLoadFromDefault).toHaveBeenCalledTimes(1);
    expect(mockLoadFromCluster).not.toHaveBeenCalled();
    expect(kubeConfig.getCurrentCluster()?.server).toBe(
      'https://example.test:6443',
    );
  });

  it('provides a Kubernetes Exec client from the shared kubeconfig', () => {
    const kubeConfig = getKubeConfigProvider().useFactory();
    const provider = getFactoryProvider(Exec);

    const exec = provider.useFactory(kubeConfig);

    expect(exec).toBeInstanceOf(Exec);
    expect(exec.kubeConfig).toBe(kubeConfig);
  });
});

type ReflectWithMetadata = typeof Reflect & {
  getMetadata(metadataKey: string, target: object): unknown;
};

interface KubeConfigProvider {
  provide: unknown;
  useFactory: () => KubeConfig;
}

function getKubeConfigProvider(): KubeConfigProvider {
  const providers =
    ((Reflect as ReflectWithMetadata).getMetadata(
      MODULE_METADATA.PROVIDERS,
      KubernetesModule,
    ) as unknown[] | undefined) ?? [];

  const provider = providers.find(
    (candidate): candidate is KubeConfigProvider =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'provide' in candidate &&
      candidate.provide === KubeConfig &&
      'useFactory' in candidate &&
      typeof candidate.useFactory === 'function',
  );

  if (!provider) {
    throw new Error('KubeConfig provider was not registered');
  }

  return provider;
}

interface FactoryProvider<T = unknown> {
  provide: unknown;
  useFactory: (...args: any[]) => T;
}

function getFactoryProvider<T>(token: unknown): FactoryProvider<T> {
  const providers =
    ((Reflect as ReflectWithMetadata).getMetadata(
      MODULE_METADATA.PROVIDERS,
      KubernetesModule,
    ) as unknown[] | undefined) ?? [];

  const provider = providers.find(
    (candidate): candidate is FactoryProvider<T> =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'provide' in candidate &&
      candidate.provide === token &&
      'useFactory' in candidate &&
      typeof candidate.useFactory === 'function',
  );

  if (!provider) {
    throw new Error('Factory provider was not registered');
  }

  return provider;
}

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
